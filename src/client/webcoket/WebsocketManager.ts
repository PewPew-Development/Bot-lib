import Websocket from "ws"
import { EventEmitter } from "events"
import { BotClient } from "../Client"
import { Events, WebsocketEvent, WSstatus } from "../../Utils/Constants"
import { delayFor } from "../../Utils/util"

export class WebSocketManager extends EventEmitter {
    ws: Websocket
    private expectedGuilds: Set<string>
    heartbeatInterval: any;
    lastSequence: number | null;
    seq: number;
    status: WSstatus
    ping: number | null;
    receivedAck: boolean;
    lastPingTimestamp: any
    lastHeartbeatAcked: boolean;
    sessionID: string | null;

    client: BotClient;

    constructor(client: BotClient) {
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
        this.lastSequence = null;
    }
    debug(message: string, shard: number = this.client.shard.id) {
        this.client.emit(Events.DEBUG, `[Ws => ${shard ? `Shard #${shard}` : 'Manager'}] ${message}`)
    }

    async connect(token?: string) {
        this.debug("Preparing to connect to the gateway")
        this.ws = new Websocket("wss://gateway.discord.gg/?v=8&encoding=json")

        this.ws.on('message', this.handlePacket.bind(this))
        this.ws.on('close', this.handleClose.bind(this))
        this.ws.on('error', this.handleError.bind(this))
        this.ws.on('open', this.handleOpen.bind(this))
    }
    async handleOpen() {
        this.debug("Connected to the Gateway")
    }
    async handlePacket(data: any) {
        const payload: DiscordGatewayPayload = JSON.parse(data)
        // console.log(payload)

        switch (payload.op) {
            case WebsocketEvent.Hello:
                this.debug("Hello Event recieved, Identifying now")
                this.Identify(this.client.options.token)
                this.setHeartbeatTimer(payload.d.heartbeat_interval)
                break;
            case WebsocketEvent.Invalid_Session:
                this.Identify(this.client.options.token)
                break;
            case WebsocketEvent.Heartbeat_ACK:
                this.ackHeartbeat()
                break;
            default:
                this.handleEvent(payload)
                if (payload.t === 'GUILD_CREATE') {
                    this.expectedGuilds.delete(payload.d.id)
                    this.checkReady()
                }
        }

        switch (payload.t) {
            case 'READY':
                this.status = WSstatus.WAITING_FOR_GUILDS
                this.expectedGuilds = new Set(payload.d.guilds.map(d => d.id))
                this.ws.send(JSON.stringify({
                    "op": 3,
                    "d": {
                        "since": null,
                        "activities": [{
                            "name": `Shard: ${this.client.shard.id} / ${this.client.shard.shardCount}`,
                            "type": 0
                        }],
                        "status": "online",
                        "afk": false
                    }
                }))
                break;

        }
    }
    async handleError(ee: any) {
        console.log(ee)
    }
    async handleClose(ee: any) {
        console.log(ee)
    }

    ackHeartbeat() {
        this.lastHeartbeatAcked = true;
        const latency = Date.now() - this.lastPingTimestamp;
        this.debug(`Heartbeat acknowledged, latency of ${latency}ms.`);
        this.ping = latency;
    }

    async handleEvent(payload: any) {
        try {
            const { default: module } = await import(`./handlers/${payload.t}`)
            module(this.client, payload, { id: Number(this.client.shard.id) })
        } catch (e) {
            console.log(e)
            this.debug(`[Event Not Found] ${payload.t} was not found in the handlers file!`)
        }
    }

    async Identify(token?: string, intent: number = 513) {
        if (this.ws.readyState != Websocket.OPEN) throw new Error(`Tried sending Identify when websocket wasnt open!`)
        console.log(this.client.shard.id, this.client.shard.shardCount)
        this.ws.send(JSON.stringify({
            "op": 2,
            "d": {
                "token": token,
                "intents": intent,
                "properties": {
                    "$os": "ios",
                    "$browser": "bot-lib",
                    "$device": "bot-lib"
                },
                "shard": [Number(this.client.shard.id), Number(this.client.shard.shardCount)]
            }
        }))
    }

    async checkReady() {
        if (this.status == WSstatus.READY) return;
        if (this.expectedGuilds.size != 0) {
            // wait for unexpected guilds or return unexpected guilds
        }

        await delayFor(2500)

        this.debug(`Shard Recieved all its guilds, marking it as ready!`)
        this.status = WSstatus.READY
        this.client.ready = true
        this.client.emit(Events.READY)
    }

    setHeartbeatTimer(time: number) {
        console.log(time)
        if (time === -1) {
            console.log('eeeee')
            if (this.heartbeatInterval) {
                this.debug('Clearing the heartbeat interval.');
                this.client.clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            return console.log('return')
        }
        this.debug(`Setting a heartbeat interval for ${time}ms.`);
        // Sanity checks
        if (this.heartbeatInterval) this.client.clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = this.client.setInterval(() => this.sendHeartbeat(), time);
    }

    sendHeartbeat() {
        this.debug(`Sending a heartbeat.`);
        this.lastHeartbeatAcked = false;
        this.lastPingTimestamp = Date.now();
        this.send(JSON.stringify({ op: WebsocketEvent.Heartbeat, d: this.seq }));
    }

    send(data: any) {
        this.ws.send(data)
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