import { Client } from "../../Client";
import { Payload, Events, WSstatus } from "../../../utils/Constants"
import { ClientUser } from "../../../structures/ClientUSer";

export default function (client: Client, data: Payload, shard: any) {
    client.user = new ClientUser(client, data.d)
}