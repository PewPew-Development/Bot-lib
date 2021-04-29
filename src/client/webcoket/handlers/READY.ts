import { Shard } from "../../../sharding/Shard";
import { BotClient } from "../../Client";
import { Payload, Events, WSstatus } from "../../../Utils/Constants"
import { ClientUser } from "../../../structures/ClientUSer";

export default function (client: BotClient, data: Payload, shard: Shard) {
    client.user = new ClientUser(client, data.d)
}