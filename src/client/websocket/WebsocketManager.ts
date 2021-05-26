import WebSocket from "ws"
import { EventEmitter } from "events"
import { Client } from "../Client"
import { Events, Payload, WsOPCodes, WSstatus } from "../../utils/Constants"
import { delayFor } from "../../utils/util"

export class WebSocketManager extends EventEmitter {
    ws: WebSocket
    heartbeatInterval: any;
    lastReceivedSequence: number;
    sequence: number;
    receivedAck: boolean;

    session: string;

    client: Client;

    constructor(client: Client) {
        super();

        //Object.defineProperty(this, 'client', { value: client });

        this.client = client;

        this.heartbeatInterval = null;
        this.sequence = 0;
        this.lastReceivedSequence = null;
    }
    debug(message: string) {
        this.client.emit(Events.DEBUG, `[Ws => Manager] ${message}`)
    }

    async connect(): Promise<void> {
        this.ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json")

        if (!this.client.options.token)
            throw new Error("Token was Unavailable to the Websocket Manager")

        this.ws.on('message', this.onMessage.bind(this))
        this.ws.on('close', this.onClose.bind(this))
        this.ws.on('error', this.onError.bind(this))
        this.ws.on('open', this.onOpen.bind(this))
    }

    private async onMessage(rawpayload) {
        const payload: Payload = JSON.parse(rawpayload.toString())

        const { op, t, s, d } = payload

        this.lastReceivedSequence = s ?? this.lastReceivedSequence ?? 0

        //console.log(payload)
        switch (op) {
            case WsOPCodes.HELLO:
                this.debug("Recieved hello, identifying now...")
                this.setHeartbeattimer(d.heartbeat_interval)
                this.idenfiyNew()
                break;

            case WsOPCodes.ACK:
                this.ackheartbeat()
                break;
            default:
                this.debug(`Opcode ${op} was not handled`)
        }
    }

    sendPacket(op: WsOPCodes, d: any, t?: string) {
        console.log({ op, d, t })
        this.send(JSON.stringify({ op, d, t }));
    }

    private idenfiyNew() {
        this.sendPacket(
            WsOPCodes.IDENTIFY,
            {
                "token": this.client.options.token,
                "intents": 513,
                "properties": {
                    "$os": process.platform,
                    "$browser": "bot-lib",
                    "$device": "bot-lib",
                }
            }
        )
    }

    send(data) {
        if (this.ws.readyState != WebSocket.OPEN) return this.debug("Tried to send a payload but websocket connection wasnt open")
        this.ws.send(data, (err) => {
            if (err) this.debug(`Error sending payload to the gateway, ${data}`)
        })
        this.sequence++;
    }

    private onOpen(data) {
        this.debug("[Connect] Connected to the Gateway, waiting for hello payload")
    }

    private onError(data) {
        console.log('Err', data)
    }

    private onClose(data) {
        console.log('CLOSE', data)
    }

    private sendHeartbeat() {
        if (!this.ws || this.ws.readyState != WebSocket.OPEN) {
            this.debug(`Tried to send a heartbeat but there isn't a open connection`)
            return this.client.clearInterval(this.heartbeatInterval)
        } else if (!this.receivedAck) {
            this.debug("Did not recieve a heartbeat ack, reconnecting...")
            this.setHeartbeattimer()
            this.ws.close()
            this.ws = null
            this.connect()
        }
        this.debug(`Sending a heartbeat.`);

        this.receivedAck = false;

        this.sendPacket(WsOPCodes.HEARTBEAT, this.sequence)
    }

    ackheartbeat() {
        this.debug("Heartbeat Acked")
        this.receivedAck = true
    }

    private setHeartbeattimer(time = -1) {
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
        if (this.heartbeatInterval === null) this.client.clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = this.client.setInterval(() => this.sendHeartbeat(), time);
        this.receivedAck = true
    }
}

export interface DiscordGatewayPayload {
    t: string,
    s: number,
    op: number,
    d: any
}