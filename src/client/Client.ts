import { ShardlientUtil } from "../sharding/ShardClientutils"
import { BaseBotClient, BotClientOptions } from "./BaseClient"
import { WebSocketManager } from "./webcoket/WebsocketManager"

export class BotClient extends BaseBotClient {
    public readonly ready: Boolean = false
    public readonly options: BotClientOptions
    public ws: WebSocketManager
    public readonly env: any
    public shard: any

    constructor(options: BotClientOptions = {}) {
        super();

        this.env = process.env
        this.shard = new ShardlientUtil(this)
        this.options = options
        this.ws = new WebSocketManager(this)
    }
    async login(token?: string): Promise<void> {
        if (!token ?? !this.options.token) throw new Error(`Please provide a token`)
        if (!this.options.token) this.options.token = token
        this.ws.connect(token)
    }
}