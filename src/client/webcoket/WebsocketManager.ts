import Websocket from "ws"
import { EventEmitter } from "events"
import { BotClient } from "../Client"
import { EVENTS, WebsocketEvent } from "../../Utils/Constants"

export class WebSocketManager extends EventEmitter {
    ws: Websocket

    heartbeatInterval: any;
    lastSequence: number | null;
    seq: number;
    ping: number;
    receivedAck: boolean;
    lastPingTimestamp: any
    lastHeartbeatAcked: boolean;
    session: string;

    client: BotClient;

    constructor(client: BotClient) {
        super();

        Object.defineProperty(this, 'client', { value: client });


        this.heartbeatInterval = null;
        this.lastHeartbeatAcked = false

        this.seq = 0;
        this.lastSequence = null;
    }
    debug(message: string, shard: number = this.client.shard.id) {
        this.client.emit(EVENTS.DEBUG, `[Ws => ${shard ? `Shard #${shard}` : 'Manager'}] ${message}`)
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
            case WebsocketEvent.DISPATCH:
                this.debug(`[Event] ${payload.t}`)
                break;
            case WebsocketEvent.Heartbeat_ACK:
                this.ackHeartbeat()
                break;
        }

        switch (payload.t) {
            case 'READY':
                console.log(payload)
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