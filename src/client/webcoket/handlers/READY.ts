import { Shard } from "../../../sharding/Shard";
import { Client } from "../../Client";
import { Payload, Events, WSstatus } from "../../../Utils/Constants"
import { ClientUser } from "../../../structures/ClientUSer";

export default function (client: Client, data: Payload, shard: Shard) {
    client.user = new ClientUser(client, data.d)
}