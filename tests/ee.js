const { Client } = require('../dist/index')
const client = new Client()

client.on('debug', (d) => console.log(d))
client.on('error', (e) => console.log(e))
client.on('ready', () => {
    //console.log(`The Client is ready!`, client.user)
    //console.log(client.guilds)
})


client.login("Nzc4OTYxODA0NjQ2ODA5NjEw.X7Zmtg.E3j27e5Z8C57_6MmiIeIrQm17IU")