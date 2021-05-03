import { GuildManager } from "../managers/GuildManager"
import { ShardlientUtil } from "../sharding/ShardClientutils"
import { BaseBotClient, BotClientOptions } from "./BaseClient"
import { ClientUser } from "../structures/ClientUSer"
import { WebSocketManager } from "./webcoket/WebsocketManager"

export class BotClient extends BaseBotClient {
    public ready: Boolean = false
    public readonly options: BotClientOptions
    public user: ClientUser | null
    public ws: WebSocketManager
    private env: any
    public shard: any
    public guilds: GuildManager

    constructor(options: BotClientOptions = {}) {
        super();

        this.env = process.env
        this.shard = this.env.SHARDING_MANAGER ? new ShardlientUtil(this, this.env) : null
        this.options = options
        this.ws = new WebSocketManager(this)
        this.user = null
        this.guilds = new GuildManager(this)
    }
    async login(token?: string): Promise<void> {
        if (!token ?? !this.options.token) throw new Error(`Please provide a token`)
        if (!this.options.token) this.options.token = token
        this.ws.connect(token)
    }
}