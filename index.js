/*const Discord = require('./src/client/Client');
const client = new Discord.Client({
    Intents: ['GUILDS']
});
require('dotenv').config();

client.on('ready', () => {
    console.log('Logged in!', client.user);
}) 

client.on('debug', (data) => {
    console.log('DEBUG', data);
})


client.login(process.env.TOKEN);*/
require('dotenv').config();
const Discord = require('./src/sharding/ShardingManager');
const Manager = new Discord.ShardingManger('./bot.js', {
    token: process.env.TOKEN,
    totalshards: 2,
    shardstospawn: 2,
})

Manager.on('shardCreate', (shard) => {
    console.log(`New shard being spawned: Shard: ${shard.id}`);

    shard.on('spawn', () => {
        console.log(`Shard ${shard.id} was spawned`)
    })

    shard.on('ready', () => {
        console.log(`Shard ${shard.id} is ready!`)
    })
})


Manager.spawn(Manager.shardstospawn);