const { WebsocketManger } = require('./Websocket/WebsocketManager');
const { EventEmitter } = require('events');
const { Events } = require('../Constants/Constants');
const { ClientOptions, Intents } = require('../Constants/Options')
const { ClientErrors } = require('../Constants/Errors');
const { RequestHandler } = require('../rest/RequestHandler');
const { ShardClientUtil } = require('../sharding/ShardClient')
const { TiiManager } = require('../utils/Tiimanager')
const { Collection } = require('../utils/Collection');
class Client extends EventEmitter {
    constructor(options) {
        super(options)

        this.options = Object.assign(ClientOptions, options)

        let data = process.env
        try {
            data = require('worker_threads').workerData || data
        } catch (err) { }
    
        if (this.options.shards === ClientOptions.shards) {
            if ('SHARDS' in data) {
                this.options.shards = JSON.parse(data.SHARDS)
            }
        }
       
        if (this.options.shardCount === ClientOptions.shardCount) {
            if ('SHARD_COUNT' in data) {
              this.options.shardCount = Number(data.SHARD_COUNT);
            } else if (Array.isArray(this.options.shards)) {
              this.options.shardCount = this.options.shards.length;
            }
          }

        const typeofShards = typeof this.options.shards;

        if (typeofShards === 'undefined' && typeof this.options.shardCount === 'number') {
            this.options.shards = Array.from({ length: this.options.shardCount }, (_, i) => i);
        }

        if (typeofShards === 'number') this.options.shards = [this.options.shards];

        if (Array.isArray(this.options.shards)) {
            this.options.shards = [
                ...new Set(
                    this.options.shards.filter(item => !isNaN(item) && item >= 0 && item < Infinity && item === (item | 0)),
                ),
            ];
        }

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

        this.shard = process.env.SHARDING_MANAGER ? ShardClientUtil.singleton(this, process.env.SHARDING_MANAGER_MODE) : null

        this.user = null

        this._tii = new TiiManager()

        this.api = new RequestHandler(this)

        this.guilds = new Collection();
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