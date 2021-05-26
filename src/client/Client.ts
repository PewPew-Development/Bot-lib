import { BaseClient, ClientOptions } from "./BaseClient"
import { ClientUser } from "../structures/ClientUSer"
import { WebSocketManager } from "./webcoket/WebsocketManager"

export class Client extends BaseClient {
    public ready: Boolean = false
    public readonly options: ClientOptions
    public user: ClientUser | null
    public ws: WebSocketManager
    private env: any

    constructor(options: ClientOptions = {}) {
        super();

        this.env = process.env
        this.options = options
        this.ws = new WebSocketManager(this)
        this.user = null
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