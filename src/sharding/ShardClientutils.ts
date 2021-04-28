import { BotClient } from "../client/Client";

export class ShardlientUtil {
    public client: BotClient
    public id: number
    public shardCount: number

    constructor(client: BotClient) {

        this.client = client
        this.id = client.env.SHARD_ID
        this.shardCount = client.env.SHARD_COUNT
    }
}