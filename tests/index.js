const { Client } = require('../dist/index')
const client = new Client()

client.on('debug', (d) => console.log(d))
client.on('error', (e) => console.log(e))
client.on('ready', () => {
    //console.log(`The Client is ready!`, client.user)
    //console.log(client.guilds)
})


client.login("ODQ2ODExMjM5NDA5NTE2NTk1.YK08bA.MFNBSc2YalAlL3mzabdq2N4XRcI")