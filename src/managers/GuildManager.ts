import { Client } from "../client/Client";
import { Guild } from "../structures/Guild";
import { BaseManager } from "./BaseManager";

/**
 * @name GuildManager
 * @description The Guild Manager for the Guild Structure
 * @extends BaseManager
 * @argument {BotClient}
 */
export class GuildManager extends BaseManager {
    constructor(client: Client) {
        super(client, Guild)
    }
}