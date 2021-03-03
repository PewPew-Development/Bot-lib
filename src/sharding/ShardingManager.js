const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { ShardManagerOptions } = require('../Constants/Options');
const { ShardmanErrors } = require('../Constants/Errors')
class ShardingManger extends EventEmitter{
    constructor(file, options = {}){
        super();

        this.options = Object.assign(ShardManagerOptions, options)

        this.file = file
        if(!file) throw new Error(ShardmanErrors.BOT_FILE_MISSING)
        if(!path.isAbsolute(file)) this.file = path.resolve(process.cwd(), file)
        const stats = fs.statSync(this.file);
        if(!stats.isFile()) throw new Error(ShardmanErrors.NOT_A_FILE)

        this.shardstospawn = this.options.shardstospawn 
        if(this.shardstospawn !== 'auto') {
            if(typeof this.shardstospawn !== 'number' || isNaN(this.shardstospawn)) {
                throw new TypeError(ShardmanErrors.INVALID_AMOUNT_TOSPAWN)
            }
            if(this.shardstospawn < 1) throw new TypeError(ShardmanErrors.MUST_BE_MORETHANONE)
            if(!Number.isInteger(this.shardstospawn)) throw new TypeError(ShardmanErrors.MUST_BE_A_INTERGER)
        }

        this.mode = this.options.mode
        if(this.mode !== 'process' && this.mode !== 'worker') {
            throw new TypeError(ShardmanErrors.INVALID_MODE)
        }

        this.autorespawn = this.options.autorespawn

        this.shardArgs = options.shardArgs;

        
        this.execArgv = options.execArgv;
    
    
        this.token = options.token || null;

        this.shards = new Set()

        process.env.SHARDING_MANAGER = true
        process.env.SHARDING_MANAGER_MODE = this.mode;
        process.env.DISCORD_TOKEN = this.token;
    }

    createShard(id = this.shards.size){
        this.shards.add(id, this)

        this.emit()
    }
}