const { EventEmitter } = require('events');
const { Endpoints, headers } = require('./Endpoints');
const { } = require('../Constants/Errors');
const { Constants } = require('../Constants/Constants');
const fetch = require('node-fetch');

class RequestHandler extends EventEmitter {
    constructor(client) {
        super(client);

        this.client = client
    }

    async gatewaybot(token = String) {
        console.log(this.client)
        headers.Authorization = `Bot ${this.client.token}`
        const respomse = await fetch(`${Constants.API}${Endpoints.gatewaybot}`, {
            method: 'GET',
            headers,
        })

        return respomse.json();
    }
}

module.exports = {
    RequestHandler
}