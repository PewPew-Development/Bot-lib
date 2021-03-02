const WebSocket = require('ws');
const { Constants, Opcodes, Heartbeat, Identify } = require('../Constants.js/Constants')
const { EventEmitter } = require('events')

class WebsocketManger extends EventEmitter {

    constructor(client){
        super();
        this.client = client
        this.client.emit = this.emit
    }

    async login(token){
        this.Websocket = new WebSocket(Constants.GATEWAY);

        this.Websocket.on('open', (socket) => {
            const data = `Connected to the gateway!`
            this.client.emit('debug', data)
        })

        this.Websocket.on('close', (code) => {
            console.log('Ws closed!', code);
        })
        
        this.Websocket.on('message', async (data) => {
            const payload = await JSON.parse(data.toString())
            //console.log(payload);

            const { t: event, op } = payload

            switch(op) {
                case Opcodes.Zero: 
                    //console.log('Zero', payload);
                    break;
                    case Opcodes.Ten:
                        const { heartbeat_interval } = payload.d
                        await this.indentify(token);
                        await this.heartbeat(heartbeat_interval);
                        break;
                        case Opcodes.Eleven: 
                        const data = `[HEARBEAT] Heartbeat recived!`
                        this.client.emit('debug', data)
                        break;
            }

            if(event) {
                const eventfile = require(`./handlers/${event}.js`);
                if(!eventfile) {
                    return console.log(`${event}.js Needed`)
                }
                eventfile(this.client, payload);
            }
        })
    }
    async indentify(token = String){
        Identify.d.token = token
        const tosend = JSON.stringify(Identify);
        this.Websocket.send(tosend);
    }

    async heartbeat(ms = Number){
        console.log(`[HEARTBEAT] Sending heartbeat every ${ms}ms`);
        setInterval(() => {
            const data = '[HEARTBEAT] Sending heartbeat...'
            const tosend = JSON.stringify(Heartbeat)
            this.Websocket.send(tosend);
            this.client.emit('debug', data)
        }, ms);
    }
}

module.exports = {
    WebsocketManger,
}