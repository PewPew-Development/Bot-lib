import { GuildManager } from "../managers/GuildManager"
import { ShardlientUtil } from "../sharding/ShardClientutils"
import { BaseClient, ClientOptions } from "./BaseClient"
import { ClientUser } from "../structures/ClientUSer"
import { WebSocketManager } from "./webcoket/WebsocketManager"

export class Client extends BaseClient {
    public ready: Boolean = false
    public readonly options: ClientOptions
    public user: ClientUser | null
    public ws: WebSocketManager
    private env: any
    public shard: any
    public guilds: GuildManager

    constructor(options: ClientOptions = {}) {
        super();

        this.env = process.env
        this.shard = this.env.SHARDING_MANAGER ? new ShardlientUtil(this, this.env) : null
        this.options = options
        this.ws = new WebSocketManager(this)
        this.user = null
        this.guilds = new GuildManager(this)
    }

    /**
     * Logs the Client in, with a websocket connection to the Discord GAteway
     * @param {string} token The Token of the Bot
     * @returns {Promise<void>} 
     * @example client.login('bot_token')
     */
    async login(token?: string): Promise<void> {
        const t = token ?? this.options.token ?? process.env.DISCORD_BOT_TOKEN
        if (!t) throw new Error("PLease provide a token")
        this.ws.connect(t)
    }
}