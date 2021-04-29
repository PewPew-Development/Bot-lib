const Discord = require('./dist/index')
const client = new Discord.BotClient()

client.on('debug', (d) => console.log(d))
client.on('ready', () => {
    console.log(`The Client is ready!`, client.user)
    client.guilds.cache.forEach((g) => console.log(g.name))
})








client.login("token")