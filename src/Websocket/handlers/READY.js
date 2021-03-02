const { ClientUser } = require('../../Objects/ClientUser');

module.exports = async (client, { d: data }) => {
    client.user = new ClientUser(client, data);
    console.log(client)
    client.emit('ready');
}