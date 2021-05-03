const { ShardingManager, Shard } = require('../dist/index')
const m = new ShardingManager('./tests/ee.js', {
    token: "token",
    shardCount: 2,
})

m.on('shardCreate', (s = new Shard()) => {
    console.log(`New Shard: #${s.id}`)
    s.on('spawn', (p) => {
        console.log(`Shard: #${s.id} was spawned`)
    })
    s.on('ready', () => console.log(`Shard #${s.id} is now ready!`))
})

m.spawn(5).catch((e) => console.log(e))
m.respawnAll()
//client.on('debug', (d) => console.log(d))