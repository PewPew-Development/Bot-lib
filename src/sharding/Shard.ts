import { EventEmitter } from "events"
import { ShardingManager } from "./ShardingManager";
import child_process from "child_process"
import { delayFor } from "../Utils/util";

export class Shard extends EventEmitter {
    public manager: ShardingManager
    public id: number;
    public ready = false;
    public process: child_process.ChildProcess;
    private _evals: Map<any, any>
    private _fetches: Map<any, any>

    constructor(manager: ShardingManager, id: number) {
        super();

        this.manager = manager
        this.id = id
        this._evals = new Map()
        this._fetches = new Map()
    }
    async spawn(spawnTimeout = 30000) {
        if (this.process) throw new Error(`Shard has been already spawned`)
        const env = {
            SHARD_ID: `${this.id}`,
            SHARD_COUNT: `${this.manager.options.shardCount}`,
            SHARDING_MANAGER: 'active',
            DISCORD_TOKEN: this.manager.options.token
        }
        this.process = child_process.fork(this.manager.file, { env })
            .on('message', this._handleMessage.bind(this))

        this.emit('spawn', this.process)

        if (spawnTimeout === -1 || spawnTimeout === Infinity) return this.process
        await new Promise((resolve, reject) => {
            const e = this
            const cleanup = () => {
                clearTimeout(spawnTimeoutTimer);
                this.off('ready', onReady);
                this.off('disconnect', onDisconnect);
                this.off('death', onDeath);
            };

            const onReady = () => {
                cleanup();
                resolve(e);
            };

            const onDisconnect = () => {
                cleanup();
                reject(new Error(`Shard #${this.id} Disconnected before becoming ready`));
            };

            const onDeath = () => {
                cleanup();
                reject(new Error(`Shard #${this.id} Died before becoming ready`));
            };

            const onTimeout = () => {
                cleanup();
                reject(new Error(`Shard #${this.id}'s client took to long to get ready`));
            };

            const spawnTimeoutTimer = setTimeout(onTimeout, spawnTimeout);
            this.once('ready', onReady);
            this.once('disconnect', onDisconnect);
            this.once('death', onDeath);
        });
        return this.process
    }
    private _handleMessage(message: any) {
        if (message) {
            // Shard is ready
            if (message._ready) {
                this.ready = true;
                /**
                 * Emitted upon the shard's {@link Client#ready} event.
                 * @event Shard#ready
                 */
                this.emit('ready');
                return;
            }

            // Shard has disconnected
            if (message._disconnect) {
                this.ready = false;
                /**
                 * Emitted upon the shard's {@link Client#disconnect} event.
                 * @event Shard#disconnect
                 */
                this.emit('disconnect');
                return;
            }

            // Shard is attempting to reconnect
            if (message._reconnecting) {
                this.ready = false;
                /**
                 * Emitted upon the shard's {@link Client#reconnecting} event.
                 * @event Shard#reconnecting
                 */
                this.emit('reconnecting');
                return;
            }
        }
    }
    kill() {
        this.process.kill()
        this._handleExit(false)
    }

    async respawn(delay = 500, spawnTimeout: number) {
        this.kill();
        if (delay > 0) await delayFor(delay);
        return this.spawn(spawnTimeout);
    }

    send(message: any) {
        return new Promise((resolve, reject) => {
            this.process.send(message, err => {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    _handleExit(respawn = this.manager.options.respawn) {
        /**
         * Emitted upon the shard's child process/worker exiting.
         * @event Shard#death
         * @param {ChildProcess|Worker} process Child process/worker that exited
         */
        this.emit('death', this.process);

        this.ready = false;
        //this.process = null;
        this._evals.clear();
        this._fetches.clear();

        if (respawn) this.spawn().catch(err => this.emit('error', err));
    }
}

interface ShardOptions {
    id?: number,
}