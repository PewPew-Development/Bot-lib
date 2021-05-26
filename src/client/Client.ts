import { BaseClient, ClientOptions } from "./BaseClient"
import { ClientUser } from "../structures/ClientUSer"
import { WebSocketManager } from "./websocket/WebsocketManager"

export class Client extends BaseClient {
    public ready: Boolean = false
    public readonly options: ClientOptions
    public user: ClientUser | null
    public ws: WebSocketManager
    private env: any
    public token: string

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
        let t = this.options.token
        if (!t) t = this.options.token = token
        if (!t) throw new Error("Please provide a token")
        this.ws.connect()
    }
}