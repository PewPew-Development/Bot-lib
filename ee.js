const Discord = require('./dist/index')
const client = new Discord.BotClient()

client.on('debug', (d) => console.log(d))

client.login("token")