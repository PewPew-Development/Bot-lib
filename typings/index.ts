/// <reference path="index.d.ts" />

import { Client } from "bot-lib"
const client = new Client({
    reconnect: true,
})

client.on('ready', () => {
    console.log('I am ready')
})

client.on('debug', (data) => {
    console.log('[DEBUG]', data)
})

client.login('bot-token')