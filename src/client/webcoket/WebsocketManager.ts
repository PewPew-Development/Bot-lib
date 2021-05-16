import Websocket from "ws"
import { EventEmitter } from "events"
import { Client } from "../Client"
import { Events, Payload, WebsocketEvent, WSstatus } from "../../Utils/Constants"
import { delayFor } from "../../Utils/util"

export class WebSocketManager extends EventEmitter {
    ws: Websocket
    private expectedGuilds: Set<string>
    private heartbeatInterval: any;
    private closeSequence: number;
    private packetQueue: Array<any>
    private lastSequence: number | null;
    private seq: number;
    public status: WSstatus
    public ping: number | null;
    private receivedAck: boolean;
    private lastPingTimestamp: any
    private lastHeartbeatAcked: boolean;
    private sessionID: string | null;
    private ratelimit: any
    client: Client;

    constructor(client: Client) {
        super();

        //Object.defineProperty(this, 'client', { value: client });

        this.sessionID = null
        this.client = client
        this.status = WSstatus.IDLE
        this.heartbeatInterval = null;
        this.lastHeartbeatAcked = false
        this.ping = -1
        this.receivedAck = false
        this.seq = 0;
        this.closeSequence = -1
        this.lastSequence = null;
        this.ratelimit = {
            queue: [],
            total: 120,
            remaining: 120,
            time: 60e3,
            timer: null,
        }
    }
    debug(message: string, shard: number = this.client.shard.id) {
        this.client.emit(Events.DEBUG, `[Ws => ${shard ? `Shard #${shard}` : 'Manager'}] ${message}`)
    }

    async connect(token?: string) {
        this.debug("Preparing to connect to the gateway")
        this.ws = new Websocket("wss://gateway.discord.gg/?v=9&encoding=json")

        this.ws.on('message', this.handlePacket.bind(this))
        this.ws.on('close', this.handleClose.bind(this))
        this.ws.on('error', this.handleError.bind(this))
        this.ws.on('open', this.handleOpen.bind(this))
    }
    async handleOpen() {
        this.debug("[CONNECT] Connected to the Gateway")
    }
    async handlePacket(data: any) {
        const payload: DiscordGatewayPayload = JSON.parse(data)

        switch (payload.op) {
            case WebsocketEvent.Hello:
                this.Identify(this.client.options.token)
                this.setHeartbeatTimer(payload.d.heartbeat_interval)
                break;
            case WebsocketEvent.Invalid_Session:
                console.log(payload)
                console.log('invalid session')
                break;
            case WebsocketEvent.Heartbeat_ACK:
                this.ackHeartbeat()
                break;
            default:
                this.handleEvent(payload)
                if (payload.t === 'GUILD_CREATE' && this.status == WSstatus.WAITING_FOR_GUILDS) {
                    this.expectedGuilds.delete(payload.d.id)
                    this.checkReady()
                }
        }

        switch (payload.t) {
            case 'READY':
                this.sessionID = payload.d.session_id
                this.status = WSstatus.WAITING_FOR_GUILDS
                this.expectedGuilds = new Set(payload.d.guilds.map((d: any) => d.id))
                break;
            case 'RESUMED':
                console.log(payload)
                break;

        }
    }
    async handleError(ee: any) {
        this.debug(`Error ${ee}`)
    }
    async handleClose(code: any) {
        if (this.seq !== -1) this.closeSequence = this.seq;
        this.seq = -1;

        this.debug(`[CLOSED] The Websocket Connection closed with the code ${code}`)

        this.setHeartbeatTimer(-1)

        if (this.ws.readyState === Websocket.OPEN) {
            this.debug(`The websocket connection close event was triggered but the connection is still open, closing it`)
            this.ws.close()
        }

        this.status = WSstatus.DISCONNECTED

        this.emit(Events.DISCONNECTED, code);

        switch (code) {
            case 4013:
                throw new Error(`Inavlid Intents provided`)
                break;
        }
    }

    ackHeartbeat() {
        this.lastHeartbeatAcked = true;
        const latency = Date.now() - this.lastPingTimestamp;
        this.debug(`Heartbeat acknowledged, latency of ${latency}ms.`);
        this.ping = latency;
    }

    async handleEvent(payload: Payload) {
        this.seq = payload.s
        try {
            const { default: module } = await import(`./handlers/${payload.t}`)
            module(this.client, payload, { id: Number(this.client.shard.id) })
        } catch (e) {
            this.debug(`[Event Not Found] ${payload.t} was not found in the handlers file!`)
        }
    }

    async Identify(token?: string, intent: number = 69) {
        if (this.ws.readyState != Websocket.OPEN) throw new Error(`Tried sending Identify when websocket wasnt open!`)
        this._send({
            "op": 2,
            "d": {
                "token": token,
                "intents": intent,
                "properties": {
                    "$os": "win-32",
                    "$browser": "bot-lib",
                    "$device": "bot-lib"
                },
                "shard": [Number(this.client.shard.id), Number(this.client.shard.shardCount)]
            }
        })
    }


    send(data: any, force = false) {
        this.ratelimit.queue[force ? 'unshift' : 'shift'](data);
        this._processQueue();
        console.log(this.ratelimit)
    }

    _send(data: any) {
        if (!this.ws || this.ws.readyState != Websocket.OPEN) {
            this.debug(`I tried to send a packet but there is no open connection | Packet: ${JSON.stringify(data)}`)
            return;
        }
        console.log(data)
        this.ws.send(JSON.stringify(data), (err) => {
            if (err) this.client.emit(Events.ERROR, err)
        })
    }

    private _processQueue() {
        if (this.ratelimit.remaining === 0) return console.log('21')
        if (this.ratelimit.queue.length === 0) return console.log('43')
        if (this.ratelimit.remaining === this.ratelimit.total) {
            console.log('23')
            this.ratelimit.timer = this.client.setTimeout(() => {
                this.ratelimit.remaining = this.ratelimit.total;
                this._processQueue();
            }, this.ratelimit.time);
        }
        while (this.ratelimit.remaining > 0) {
            const item = this.ratelimit.queue.shift();
            if (!item) return console.log('hi')
            console.log('RATELIMIT_QUEUE', item)
            this._send(item);
            this.ratelimit.remaining--;
        }
    }

    async checkReady() {
        if (this.status == WSstatus.READY) return;
        if (this.expectedGuilds.size != 0) {
            // wait for unexpected guilds or return unexpected guilds
        }

        this.debug(`Shard Recieved all its guilds, marking it as ready!`)
        this.status = WSstatus.READY
        this.client.ready = true
        this.client.emit(Events.READY)
    }

    setHeartbeatTimer(time: number) {
        if (time === -1) {
            if (this.heartbeatInterval) {
                this.debug('Clearing the heartbeat interval.');
                this.client.clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            return
        }
        this.debug(`Setting a heartbeat interval for ${time}ms.`);
        // Sanity checks
        if (this.heartbeatInterval) this.client.clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = this.client.setInterval(() => this.sendHeartbeat(), time);
    }

    sendHeartbeat() {
        if (!this.ws || this.ws.readyState != Websocket.OPEN) {
            this.debug(`Tried to send a heartbeat but there isn't a open connection`)
            return this.client.clearInterval(this.heartbeatInterval)
        }
        this.debug(`Sending a heartbeat.`);
        this.lastHeartbeatAcked = false;
        this.lastPingTimestamp = Date.now();
        this.send({ op: WebsocketEvent.Heartbeat, d: this.seq })
    }

    destroy(data: any) {

    }
}

export interface DiscordGatewayPayload {
    t: string,
    s: number,
    op: number,
    d: any
}