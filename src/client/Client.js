const { EventEmitter } = require('events');
const { ClientOptions } = require('../Constants/Options')

/**
 * The Main class for interacting with the Discord Api
 * @extends {EventEmitter}
 */
class Client extends EventEmitter{
    constructor(options = {}){
      this.options = Object.assign(ClientOptions, options)

      let data = process.env
      try {
          data = require('worker_threads').workerData || data
      } catch (err) { }


    }
}