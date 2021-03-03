const { ClientUser } = require('../../../structures/ClientUser');

module.exports = (client, { d: data }, shard) => {
    if (client.user) {
        client.user._set(data.user);
    } else {
        const clientUser = new ClientUser(client, data.user);
        client.user = clientUser;
        //client.users.cache.set(clientUser.id, clientUser);
    }

    for (const guild of data.guilds) {
        guild.shardID = shard.id;
        //client.guilds.add(guild);
    }

    shard.checkReady();
};