const { ShardEvents, Events, Status, WSEvents, WSCodes } = require('../../Constants/Constants')
const { EventEmitter } = require('events')
const { ShardWebSocket } = require('./ShardWebsocket')
const PacketHandlers = require('./handlers')
const BeforeReadyWhitelist = [
    WSEvents.READY,
    WSEvents.RESUMED,
    WSEvents.GUILD_CREATE,
    WSEvents.GUILD_DELETE,
    WSEvents.GUILD_MEMBERS_CHUNK,
    WSEvents.GUILD_MEMBER_ADD,
    WSEvents.GUILD_MEMBER_REMOVE,
];

const UNRECOVERABLE_CLOSE_CODES = Object.keys(WSCodes).slice(1).map(Number);
const UNRESUMABLE_CLOSE_CODES = [1000, 4006, 4007];

class WebsocketManger extends EventEmitter {

    constructor(client) {
        super();

        this.client = client

        this.status = Status.IDLE;

        this.shards = new Map()
      
        this.destroyed = false;

        this.reconnecting = false;

        this.packetQueue = []
    }

    async connect() {
        this.debug('Fetching info from the gateway')

        const {
            url: gatewayURL,
            shards: recommendedShards,
            session_start_limit: sessionStartLimit } = await this.client.api.gatewaybot()


        this.debug(`Fetched info: 
        Recommened Shards: ${recommendedShards}`)

        const { total, remaining, reset_after } = sessionStartLimit;
        this.sessioninfo = sessionStartLimit

        this.debug(`Session info: 
        Total: ${total}
        Remaining: ${remaining}`)

        let { shards } = this.client.options

        if (shards === 'auto') {
            this.debug(`Client will be using recommend shards by discord: ${recommendedShards}`)
            this.totalShards = this.client.options.shardCount = recommendedShards;
            shards = this.client.options.shards = Array.from({ length: recommendedShards }, (_, i) => i);
        }

        this.totalShards = shards.length;
        this.debug(`Spawning Shards: ${shards.join(', ')}`);
        this.shardqueue = new Set(shards.map(id => new ShardWebSocket(this, id)));
        await this._handleSessionLimit(remaining, reset_after);
        return this.createShards();
    }

    get ping() {
        const sum = this.shards.reduce((a, b) => a + b.ping, 0);
        return sum / this.shards.size;
    }

    debug(message, shard) {
        this.client.emit(Events.DEBUG, `[Websocket => ${shard ? `Shard ${shard.id}` : 'Client'}] ${message}`)
    }

    async createShards() {
        if (!this.shardqueue.size) return false;

        const [shard] = this.shardqueue;

        this.shardqueue.delete(shard);

        if (!shard.eventsAttached) {
            shard.on(ShardEvents.ALL_READY, unvGuilds => {


                this.client.emit(Events.SHARD_READY, shard.id, unvGuilds)

                if (!this.shardqueue.size) this.reconnecting = false

                this.checkShardsReady()
            })

            shard.on(ShardEvents.CLOSE, event => {
                if (event.code === 1000 ? this.destroyed : UNRECOVERABLE_CLOSE_CODES.includes(event.code)) {
                    /**
                     * Emitted when a shard's WebSocket disconnects and will no longer reconnect.
                     * @event Client#shardDisconnect
                     * @param {CloseEvent} event The WebSocket close event
                     * @param {number} id The shard ID that disconnected
                     */
                    this.client.emit(Events.SHARD_DISCONNECT, event, shard.id);
                    this.debug(WSCodes[event.code], shard);
                    return;
                }

                if (UNRESUMABLE_CLOSE_CODES.includes(event.code)) {
                    // These event codes cannot be resumed
                    shard.sessionID = null;
                }

                /**
        * Emitted when a shard is attempting to reconnect or re-identify.
        * @event Client#shardReconnecting
        * @param {number} id The shard ID that is attempting to reconnect
        */
                this.client.emit(Events.SHARD_RECONNECTING, shard.id);

                this.shardqueue.add(shard);

                if (shard.sessionID) {
                    this.debug(`Session ID is present, attempting an immediate reconnect...`, shard);
                    this.reconnect(true);
                } else {
                    shard.destroy({ reset: true, emit: false, log: false });
                    this.reconnect();
                }
            })

            shard.on(ShardEvents.INVALID_SESSION, () => {
                this.client.emit(Events.SHARD_RECONNECTING, shard.id);
            });

            shard.on(ShardEvents.DESTROYED, () => {
                this.debug('Shard was destroyed but no WebSocket connection was present! Reconnecting...', shard);

                this.client.emit(Events.SHARD_RECONNECTING, shard.id);

                this.shardqueue.add(shard);
                this.reconnect();
            });

            shard.eventsAttached = true;
        }

        this.shards.set(shard.id, shard)

        try {
            await shard.connect();
        } catch (error) {
            if (!error || error.code) {
                this.debug('Failed to connect to the gateway, requeueing...', shard);
                this.shardqueue.add(shard);
            } else {
                throw error;
            }
        }

        if (this.shardqueue.size) {
            this.debug(`Shard Queue Size: ${this.shardqueue.size}; continuing in 5 seconds...`);
            await new Promise((resole, reject) => setTimeout((e) => { resole(e) }, 5000))
            await this._handleSessionLimit();
            return this.createShards();
        }

        return true;
    }

    async _handleSessionLimit(remaining, resetAfter) {
        if (typeof remaining === 'undefined' && typeof resetAfter === 'undefined') {
            const { session_start_limit } = await this.client.api.gatewaybot();
            this.sessionStartLimit = session_start_limit;
            remaining = session_start_limit.remaining;
            resetAfter = session_start_limit.reset_after;
            this.debug(`Session Limit Information
        Total: ${session_start_limit.total}
        Remaining: ${remaining}`);
        }
        if (!remaining) {
            this.debug(`Exceeded identify threshold. Will attempt a connection in ${resetAfter}ms`);
            await setTimeout((e) => e, resetAfter);
        }
    }

    async reconnect(skipLimit = false) {
        if (this.reconnecting || this.status !== Status.READY) return false;
        this.reconnecting = true;
        try {
            if (!skipLimit) await this._handleSessionLimit();
            await this.createShards();
        } catch (error) {
            this.debug(`Couldn't reconnect or fetch information about the gateway. ${error}`);
            if (error.httpStatus !== 401) {
                this.debug(`Possible network error occurred. Retrying in 5s...`);
                await setTimeout((e) => e, 5000);
                this.reconnecting = false;
                return this.reconnect();
            }
            // If we get an error at this point, it means we cannot reconnect anymore
            if (this.client.listenerCount(Events.INVALIDATED)) {
                /**
                 * Emitted when the client's session becomes invalidated.
                 * You are expected to handle closing the process gracefully and preventing a boot loop
                 * if you are listening to this event.
                 * @event Client#invalidated
                 */
                this.client.emit(Events.INVALIDATED);
                // Destroy just the shards. This means you have to handle the cleanup yourself
                this.destroy();
            } else {
                this.client.destroy();
            }
        } finally {
            this.reconnecting = false;
        }
        return true;
    }

    broadcast(packet) {
        for (const shard of this.shards.values()) shard.send(packet);
    }

    /**
     * Destroys this manager and all its shards.
     * @private
     */
    destroy() {
        if (this.destroyed) return;
        this.debug(`Manager was destroyed. Called by:\n${new Error('MANAGER_DESTROYED').stack}`);
        this.destroyed = true;
        this.shardQueue.clear();
        for (const shard of this.shards.values()) shard.destroy({ closeCode: 1000, reset: true, emit: false, log: false });
    }

    handlePacket(packet, shard) {
        if (packet && this.status !== Status.READY) {
            if (!BeforeReadyWhitelist.includes(packet.t)) {
                this.packetQueue.push({ packet, shard });
                return false;
            }
        }

        if (this.packetQueue.length) {
            const item = this.packetQueue.shift();
            this.client.setImmediate(() => {
                this.handlePacket(item.packet, item.shard);
            });
        }

        if (packet && PacketHandlers[packet.t]) {
            PacketHandlers[packet.t](this.client, packet, shard);
        }

        return true;
    }

    checkShardsReady() {
        if (this.status === Status.READY) return;
        if (this.shards.size !== this.totalShards || this.shards.get(s => s.status !== Status.READY)) {
            return;
        }

        this.triggerClientReady();
    }

    /**
     * Causes the client to be marked as ready and emits the ready event.
     * @private
     */
    triggerClientReady() {
        this.status = Status.READY;

        this.client.readyAt = new Date();

        /**
         * Emitted when the client becomes ready to start working.
         * @event Client#ready
         */

        this.client.emit(Events.CLIENT_READY);

        this.handlePacket();
    }
}

module.exports = {
    WebsocketManger,
}