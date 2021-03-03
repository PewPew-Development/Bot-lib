const fetch = require('node-fetch');
const { Constants } = require('../Constants/Constants')
const { Endpoints } = require('../rest/Endpoints');
class Utils{
    constructor(){
        throw new Error('Do not init this class!')
    }

    static fetchRecommendedShards(token, guildsPerShard = 1000) {
        if (!token) throw new Error('TOKEN_MISSING');
        return fetch(`${Constants.API}${Endpoints.gatewaybot}`, {
          method: 'GET',
          headers: { Authorization: `Bot ${token}` },
        })
          .then(res => {
            if (res.ok) return res.json();
            if (res.status === 401) throw new Error('TOKEN_INVALID');
            throw res;
          })
          .then(data => data.shards * (1000 / guildsPerShard));
      }
}

module.exports = {
    Utils,
}