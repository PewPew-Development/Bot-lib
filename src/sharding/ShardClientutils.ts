import { BotClient } from "../client/Client";
import { Events } from "../Utils/Constants";

export class ShardlientUtil {
    public client: BotClient
    public id: number
    public shardCount: number

    constructor(client: BotClient) {

        this.client = client
        this.id = client.env.SHARD_ID
        this.shardCount = client.env.SHARD_COUNT

        process.on('message', this._handleMessage.bind(this))
        client.on(Events.READY, () => {
            process.send({ _ready: true })
        })
    }
    private async _handleMessage(data: any) {
        console.log(data)
    }
}