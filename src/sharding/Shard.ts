import { EventEmitter } from "events"
import { ShardingManager } from "./ShardingManager";
import child_process from "child_process"

export class Shard extends EventEmitter {
    public manager: ShardingManager
    public id: number;
    public ready = false;
    public process: any;

    constructor(manager: ShardingManager, id: number) {
        super();

        this.manager = manager
        this.id = id
    }
    async spawn() {
        if (this.process) throw new Error(`Shard has been already spawned`)
        const env = {
            SHARD_ID: `${this.id}`,
            SHARD_COUNT: `${this.manager.options.shardCount}`,
            SHARDING_MANAGER: 'active',
            DISCORD_TOKEN: this.manager.options.token
        }
        this.process = child_process.fork(this.manager.file, { env })

        this.emit('spawn', this.process)
    }
}

interface ShardOptions {
    id?: number,
}