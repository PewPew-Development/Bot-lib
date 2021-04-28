import { EventEmitter } from "events"
import { Shard } from "./Shard"
import * as util from "../Utils/util"
import path from "path"
import fs from "fs"

export class ShardingManager extends EventEmitter {
    public readonly options: any
    public readonly file: any
    public shards: Map<number, Shard> = new Map()

    constructor(file: any, options: ShardingOptions = {}) {
        super();

        this.options = options
        this.file = file
        if (!file) throw new Error(`Please specify a file for the sharding manager`)
        if (!path.isAbsolute(file)) this.file = path.resolve(process.cwd(), file);
        const stats = fs.statSync(this.file);
        if (!stats.isFile()) throw new Error('File provided is not a valid file');

        process.env.SHARDING_MANAGER = 'active';
        process.env.DISCORD_TOKEN = this.options.token;
    }
    async spawn(amount: number | string = this.options.shardCount, delay: number = 5500, spawnTimeout = 3000) {
        if (amount == 'auto') {
            amount = this.options.shardCount = await util.fetchRecommendedShards(this.options.token)
        } else if (typeof amount != 'number' || isNaN(amount)) throw new TypeError(`Numbers of shard must be a number`)
        else if (amount < 1) throw new RangeError('The amount of shards must be atleast one');
        else if (!Number.isInteger(amount)) throw new TypeError('Amount of shards must be an interger');

        if (this.shards.size >= amount) throw new Error('All shards have already been spawned');

        const shardlist: Array<number> = [...Array(amount).keys()]
        console.log(shardlist)

        for (const id of shardlist) {
            const promises = [];
            const shard = this.createShard(id)
            promises.push((await shard).spawn());
            if (delay > 0 && this.shards.size !== shardlist.length) promises.push(util.delayFor(delay));
            await Promise.all(promises);
        }

        return this.shards;
    }

    async createShard(id: number): Promise<Shard> {
        const shard = new Shard(this, id)
        this.shards.set(id, shard)

        this.emit('shardCreate', shard)
        return shard
    }
}

interface ShardingOptions {
    shardCount?: number | string,
    token?: string,
}