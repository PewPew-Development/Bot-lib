const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { ShardManagerOptions } = require('../Constants/Options');
const { ShardmanErrors } = require('../Constants/Errors')
const { ShardEvents } = require('../Constants/Constants');
const { Shard } = require('./Shard')
const { Utils } = require('../utils/uitls');
const { TiiManager } = require('../utils/Tiimanager');

class ShardingManger extends EventEmitter {
    constructor(file, options = {}) {
        super();

        this.options = Object.assign(ShardManagerOptions, options)

        this.file = file
        if (!file) throw new Error(ShardmanErrors.BOT_FILE_MISSING)
        if (!path.isAbsolute(file)) this.file = path.resolve(process.cwd(), file)
        const stats = fs.statSync(this.file);
        if (!stats.isFile()) throw new Error(ShardmanErrors.NOT_A_FILE)

        this.shardList = this.options.shardList || 'auto'
        if (this.shardList !== 'auto') {
            if (!Array.isArray(this.shardList)) {
                throw new TypeError(ShardmanErrors.SHARDSLIST_ARRAY);
            }
            this.shardList = [...new Set(this.shardList)];
            if (this.shardList.length < 1) throw new RangeError(ShardmanErrors.INVALID_SHARD_ID);
            if (
                this.shardList.some(
                    shardID => typeof shardID !== 'number' || isNaN(shardID) || !Number.isInteger(shardID) || shardID < 0,
                )
            ) {
                throw new TypeError(ShardmanErrors.MUST_BE_A_INTERGER);
            }
        }

        this.shardstospawn = this.options.shardstospawn

        if (this.shardstospawn !== 'auto') {
            if (typeof this.shardstospawn !== 'number' || isNaN(this.shardstospawn)) {
                throw new TypeError(ShardmanErrors.INVALID_AMOUNT_TOSPAWN)
            }
            if (this.shardstospawn < 1) throw new TypeError(ShardmanErrors.MUST_BE_MORETHANONE)
            if (!Number.isInteger(this.shardstospawn)) throw new TypeError(ShardmanErrors.MUST_BE_A_INTERGER)
        }

        this.mode = this.options.mode
        if (this.mode !== 'process' && this.mode !== 'worker') {
            throw new TypeError(ShardmanErrors.INVALID_MODE)
        }

        this.autorespawn = this.options.autorespawn

        this.shardArgs = options.shardArgs;


        this.execArgv = options.execArgv;

        this.tii = new TiiManager({ client: this })

        this.token = options.token || null;

        this.shards = new Map()

        process.env.SHARDING_MANAGER = true
        process.env.SHARDING_MANAGER_MODE = this.mode;
        process.env.DISCORD_TOKEN = this.token;
    }

    createShard(id = this.shards.size) {
        const shard = new Shard(this, id)
        this.shards.set(id, shard)


        this.emit(ShardEvents.SHARDCREATE, shard);
        return shard;
    }

    async spawn(amount = this.shardstospawn, delay = 5500, spawnTimeout) {
        if (amount === 'auto') {
            this.shardList = 'auto'
            amount = Utils.fetchRecommendedShards(this.token);
        } else {
            if (typeof amount !== 'number' || isNaN(amount)) {
                throw new TypeError(ShardmanErrors.INVALID_AMOUNT_TOSPAWN)
            }
            if (amount < 1) throw new TypeError(ShardmanErrors.MUST_BE_MORETHANONE)
            if (!Number.isInteger(amount)) throw new TypeError(ShardmanErrors.MUST_BE_A_INTERGER)
        }

        if (this.shards.size >= amount) throw new Error(ShardmanErrors.SHARDS_ALREADY_SPAWNED)
        if (this.shardList === 'auto' || this.shardstospawn === 'auto' || this.shardstospawn !== amount) {
            this.shardList = [...Array(amount).keys()];
        }

        if (this.shardstospawn === 'auto' || this.shardstospawn !== amount) {
            this.shardstospawn = amount;
        }

        for (const shardID of this.shardList) {
            const promises = [];
            const shard = this.createShard(shardID);
            promises.push(shard.spawn(spawnTimeout));
            if (delay > 0 && this.shards.size !== this.shardList.length) promises.push(setTimeout(() => { }, delay));
            await Promise.all(promises);
        }

        return this.shards;
    }

    broadcast(message) {
        const promises = [];
        for (const shard of this.shards.values()) promises.push(shard.send(message));
        return Promise.all(promises);
    }

    broadcastEval(script, shard) {
        return this._performOnShards('eval', [script], shard);
      }
    
      /**
       * Fetches a client property value of each shard, or a given shard.
       * @param {string} prop Name of the client property to get, using periods for nesting
       * @param {number} [shard] Shard to fetch property from, all if undefined
       * @returns {Promise<*>|Promise<Array<*>>}
       * @example
       * manager.fetchClientValues('guilds.cache.size')
       *   .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
       *   .catch(console.error);
       */
      fetchClientValues(prop, shard) {
        return this._performOnShards('fetchClientValue', [prop], shard);
      }
    
      /**
       * Runs a method with given arguments on all shards, or a given shard.
       * @param {string} method Method name to run on each shard
       * @param {Array<*>} args Arguments to pass through to the method call
       * @param {number} [shard] Shard to run on, all if undefined
       * @returns {Promise<*>|Promise<Array<*>>} Results of the method execution
       * @private
       */
      _performOnShards(method, args, shard) {
        if (this.shards.size === 0) return Promise.reject(new Error('SHARDING_NO_SHARDS'));
    
        if (typeof shard === 'number') {
          if (this.shards.has(shard)) return this.shards.get(shard)[method](...args);
          return Promise.reject(new Error('SHARDING_SHARD_NOT_FOUND', shard));
        }
    
        if (this.shards.size !== this.shardList.length) return Promise.reject(new Error('SHARDING_IN_PROCESS'));
    
        const promises = [];
        for (const sh of this.shards.values()) promises.push(sh[method](...args));
        return Promise.all(promises);
      }
    
      /**
       * Kills all running shards and respawns them.
       * @param {number} [shardDelay=5000] How long to wait between shards (in milliseconds)
       * @param {number} [respawnDelay=500] How long to wait between killing a shard's process and restarting it
       * (in milliseconds)
       * @param {number} [spawnTimeout=30000] The amount in milliseconds to wait for a shard to become ready before
       * continuing to another. (-1 or Infinity for no wait)
       * @returns {Promise<Collection<string, Shard>>}
       */
      async respawnAll(shardDelay = 5000, respawnDelay = 500, spawnTimeout) {
        let s = 0;
        for (const shard of this.shards.values()) {
          const promises = [shard.respawn(respawnDelay, spawnTimeout)];
          if (++s < this.shards.size && shardDelay > 0) promises.push(setTimeout(() => {}, shardDelay));
          await Promise.all(promises); // eslint-disable-line no-await-in-loop
        }
        return this.shards;
      }
}

module.exports = {
    ShardingManger,
}