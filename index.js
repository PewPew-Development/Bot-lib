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
})

m.spawn()
//client.on('debug', (d) => console.log(d))