const { Constants, Opcodes, Heartbeat, Identify, Events } = require('../../Constants/Constants')
const { EventEmitter } = require('events')
const { ShardWebSocket } = require('./ShardWebsocket')
class WebsocketManger extends EventEmitter {

    constructor(client) {
        super();

        this.client = client

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
        this.debug(`Spawning shards: ${shards.join(', ')}`);
        this.shardqueue = new Set(shards.map(id => new ShardWebSocket(this, id)));
        await this._handleSessionLimit(remaining, reset_after);
        return this.createShards();
    }

    debug(message, shard) {
        this.client.emit(Events.DEBUG, `[Websocket => ${shard ? `Shard ${shard.id}` : 'Client'}] ${message}`)
    }

   async createShards() {
        if (!this.shardqueue.size) return false;

        const [shard] = this.shardqueue;

        this.shardqueue.delete(shard);

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
            await new Promise((resole, reject) => setTimeout((e) => {resole(e)}, 5000))
            await this._handleSessionLimit();
            return this.createShards();
        }

        return true;
    }

    async _handleSessionLimit(remaining, resetAfter) {
        if (typeof remaining === 'undefined' && typeof resetAfter === 'undefined') {
            const { session_start_limit } = await this.client.api.gateway.bot.get();
            this.sessionStartLimit = session_start_limit;
            remaining = session_start_limit.remaining;
            resetAfter = session_start_limit.reset_after;
            this.debug(`Session Limit Information
        Total: ${session_start_limit.total}
        Remaining: ${remaining}`);
        }
        if (!remaining) {
            this.debug(`Exceeded identify threshold. Will attempt a connection in ${resetAfter}ms`);
            await Util.delayFor(resetAfter);
        }
    }
}

module.exports = {
    WebsocketManger,
}