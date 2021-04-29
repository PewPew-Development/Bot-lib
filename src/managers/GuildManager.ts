import { BotClient } from "../client/Client";
import { Guild } from "../structures/Guild";
import { BaseManager } from "./BaseManager";

export class GuildManager extends BaseManager {
    constructor(client: BotClient) {
        super(client, Guild)
    }
}