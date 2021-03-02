const Discord = require('./src/client/Client');
const client = new Discord.Client();
require('dotenv').config();

client.on('ready', () => {
    console.log('Logged in!', client.user);
}) 

client.on('debug', (data) => {
    console.log('DEBUG', data);
})


client.login(process.env.TOKEN);