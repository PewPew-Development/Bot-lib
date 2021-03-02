'use strict';

const WebSocket = require('ws');
const EventEmitter = require('events');
const { Constants } = require('../../Constants/Constants')

class ShardWebSocket extends EventEmitter {
  constructor(manager, id) {
    super();

   
    this.manager = manager;
    this.id = id;
    this.sequence = -1;
    this.closeSequence = 0;
    this.sessionID = null;
    this.ping = -1;
    this.lastPingTimestamp = -1;
    this.lastHeartbeatAcked = true;


    Object.defineProperty(this, 'connection', { value: null, writable: true });

   
    Object.defineProperty(this, 'helloTimeout', { value: null, writable: true });


    Object.defineProperty(this, 'eventsAttached', { value: false, writable: true });

  
    Object.defineProperty(this, 'expectedGuilds', { value: null, writable: true });

    Object.defineProperty(this, 'readyTimeout', { value: null, writable: true });


    Object.defineProperty(this, 'connectedAt', { value: 0, writable: true });
  }

  debug(message) {
    this.manager.debug(message, this);
  }

  connect() {
    const { client } = this.manager;

    const ws = (this.connection = new WebSocket(Constants.GATEWAY))
    this.connected = Date.now()
    ws.on('open', () => this.onOpen(this))
    ws.on('message', (msg) => this.onMsg(msg));
  }

  onOpen(){
      this.debug(`[CONNECTED] {Shard: ${this.id}} it took me ${Date.now() - this.connectedAt}ms to connect!`)
  }

  onMsg(payload){
      let raw = payload
    let packet;
      try {
        packet = JSON.parse(payload.toString())
      } catch(err) {
          return;
      }
      this.onPacket(packet);
  }

  onPacket(packet) {
      console.log(packet);
      console.log(this)
    if (!packet) {
      this.debug(`Received broken packet: '${packet}'.`);
      return;
    }

    switch (packet.t) {

    }

    if (packet.s > this.sequence) this.sequence = packet.s;

    switch (packet.op) {

    }
}

}

module.exports = {
    ShardWebSocket
}