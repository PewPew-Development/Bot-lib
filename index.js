const Discord = require('./dist/index')
const m = new Discord.ShardingManager('./ee.js', {
    token: "token",
    shardCount: 2,
})

m.on('shardCreate', (s) => {
    console.log(`New Shard: #${s.id}`)
    s.on('spawn', (p) => {
        console.log(`Shard: #${s.id} was spawned`)
    })
    s.on('ready', () => console.log(`Shard #${s.id} is now ready!`))
})

m.spawn().catch((e) => console.log(e))
//client.on('debug', (d) => console.log(d))