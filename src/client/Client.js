const { WebsocketManger } = require('../Websocket/WebsocketManager');
const { EventEmitter } = require('events');
const { ClientUser } = require('../Objects/ClientUser');

class Client extends EventEmitter {
    constructor(){
        super()
        this.ws = new WebsocketManger(this);
        this._user = ClientUser
    }

    async login(token){
         if (!token) {
            throw new TypeError('[NO_FIELD] A token wasn\'t provided!')
        } else if(typeof token !== 'string') {
            throw new TypeError('[INVALID_STRING] Token must be a string!')
        } 
        this.ws.login(token)
        this.token = token
    }
    
    set user(user = ClientUser) {
        this._user = user
    }

    get user() {
        return this._user;
    }
}

module.exports ={
    Client,
}