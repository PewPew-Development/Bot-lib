const { WebsocketManger } = require('./Websocket/WebsocketManager');
const { EventEmitter } = require('events');
const { Events } = require('../Constants/Constants');
const { ClientOptions, Intents } = require('../Constants/Options')
const { ClientErrors } = require('../Constants/Errors');
const { RequestHandler } = require('../rest/RequestHandler');

class Client extends EventEmitter {
    constructor(options) {
        super(options)

        this.options = Object.assign(ClientOptions, options)



        if (this.options.hasOwnProperty('Intents')) {
            let bitmask = 0;
            if (Array.isArray(this.options.Intents)) {
                for (const intent of this.options.Intents) {
                    if (Intents[intent.toUpperCase()]) {
                        bitmask |= Intents[intent]
                    } else {
                        throw new TypeError(ClientErrors.INVALID_INTENT);
                    }
                }
            } else if (this.options.Intents === 'All') {
                for (const int of Object.keys(Intents)) {
                    bitmask |= Intents[int]
                }
            }
            this.options.Intents = bitmask
        }

        this.ws = new WebsocketManger(this);

        this.user = null

        this.api = new RequestHandler(this)
    }

    async login(token = String) {
        if (!token) throw new Error(ClientErrors.MISSING_TOKEN)
        else if (typeof token != 'string') throw new TypeError(ClientErrors.TOKEN_NOT_STRING);
        this.token = token
        this.emit(Events.DEBUG, 'Starting connection to the gateway...')

        try {
            this.ws.connect();
        } catch (err) {
            throw err
        }
    }
}

module.exports = {
    Client,
}