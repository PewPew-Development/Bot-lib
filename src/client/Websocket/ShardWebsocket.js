'use strict';

const WebSocket = require('ws');
const EventEmitter = require('events');
const { Constants, ShardEvents, OpCodes, WSEvents, Status, Events } = require('../../Constants/Constants')
const os = require('os');

const STATUS_KEYS = Object.keys(Status);
const CONNECTION_STATE = Object.keys(WebSocket);

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
    this.status = Status.IDLE


    Object.defineProperty(this, 'connection', { value: null, writable: true });

    Object.defineProperty(this, 'ratelimit', {
      value: {
        queue: [],
        total: 120,
        remaining: 120,
        time: 60e3,
        timer: null,
      },
    });

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

    if (this.connection && this.connection.readyState === WebSocket.OPEN && this.status === Status.READY) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        this.removeListener(ShardEvents.CLOSE, onClose);
        this.removeListener(ShardEvents.READY, onReady);
        this.removeListener(ShardEvents.RESUMED, onResumed);
        this.removeListener(ShardEvents.INVALID_SESSION, onInvalidOrDestroyed);
        this.removeListener(ShardEvents.DESTROYED, onInvalidOrDestroyed);
      };

      const onReady = () => {
        cleanup();
        resolve();
      };

      const onResumed = () => {
        cleanup();
        resolve();
      };

      const onClose = event => {
        cleanup();
        reject(event);
      };

      const onInvalidOrDestroyed = () => {
        cleanup();
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
      };

      this.once(ShardEvents.READY, onReady);
      this.once(ShardEvents.RESUMED, onResumed);
      this.once(ShardEvents.CLOSE, onClose);
      this.once(ShardEvents.INVALID_SESSION, onInvalidOrDestroyed);
      this.once(ShardEvents.DESTROYED, onInvalidOrDestroyed);

      if (this.connection && this.connection.readyState === WebSocket.OPEN) {
        this.debug('An open connection was found, attempting an immediate identify.');
        this.identify();
        return;
      }

      if (this.connection) {
        this.debug(`A connection object was found. Cleaning up before continuing.
    State: ${CONNECTION_STATE[this.connection.readyState]}`);
        this.destroy({ emit: false });
      }


      this.debug('Connecting to the gateway..')
      this.status = this.status === Status.DISCONNECTED ? Status.RECONNECTING : Status.CONNECTING;
      const ws = (this.connection = new WebSocket(Constants.GATEWAY))
      this.setHelloTimeout()
      this.connected = Date.now()
      ws.onopen = this.onOpen.bind(this)
      ws.onmessage = this.onMsg.bind(this)
      ws.onclose = this.onClose.bind(this)
      ws.onerror = this.onError.bind(this)
    })
  }

  onOpen() {
    this.debug(`[CONNECTED] It took ${Date.now() - this.connectedAt.toFixed(2)}ms to connect!`)
    this.status = Status.NEARLY;
  }

  onMsg({ data }) {
    let raw = data

    let packet;
    try {
      packet = JSON.parse(raw)
    } catch (err) {
      console.log(err)
    }
    this.onPacket(packet);
  }

  onPacket(packet) {
    if (!packet) {
      this.debug(`Received broken packet: '${packet}'.`);
      return;
    }

    switch (packet.t) {
      case WSEvents.READY:

        this.emit(ShardEvents.READY);

        this.sessionID = packet.d.session_id;
        this.expectedGuilds = new Set(packet.d.guilds.map(d => d.id));
        this.status = Status.WAITING_FOR_GUILDS;
        this.debug(`[READY] Session ${this.sessionID}.`);
        this.lastHeartbeatAcked = true;
        this.sendHeartbeat('ReadyHeartbeat');
        break;
      case WSEvents.RESUMED:

        this.emit(ShardEvents.RESUMED);

        this.status = Status.READY;
        this.status = Status.READY;
        const replayed = packet.s - this.closeSequence;
        this.debug(`[RESUMED] Session ${this.sessionID} | Replayed ${replayed} events.`);
        this.lastHeartbeatAcked = true;
        this.sendHeartbeat('ResumeHeartbeat');
        break;
    }

    if (packet.s > this.sequence) this.sequence = packet.s;

    switch (packet.op) {
      case OpCodes.HELLO:
        this.setHelloTimeout(-1);
        this.setHeartbeatTimer(packet.d.heartbeat_interval)
        this.identify();
        break;
      case OpCodes.RECONNECT:
        this.debug('[RECONNECT] Discord asked us to reconnect');
        this.destroy({ closeCode: 4000 });
        break;
      case OpCodes.INVALID_SESSION:
        this.debug(`[INVALID SESSION] Resumable: ${packet.d}.`);
        if (packet.d) {
          this.identifyResume();
          return;
        }
        this.sequence = -1;
        this.status = Status.RECONNECTING;
        this.sessionID = null;
        this.emit(ShardEvents.INVALID_SESSION);
        break;
      case OpCodes.HEARTBEAT_ACK:
        this.ackHeartbeat();
        break;
      case OpCodes.HEARTBEAT:
        this.sendHeartbeat('HeartbeatRequest', true);
        break;
      default:
        this.manager.handlePacket(packet, this);
        if (this.status === Status.WAITING_FOR_GUILDS && packet.t === WSEvents.GUILD_CREATE) {
          this.expectedGuilds.delete(packet.d.id);
          this.checkReady();
        }
      }
    }

    onError(event) {
      const error = event && event.error ? event.error : event;
      if (!error) return;

      this.manager.client.emit(Events.SHARD_ERROR, error, this.id);
    }

    onClose(event) {
      if (this.sequence !== -1) this.closeSequence = this.sequence;
      this.sequence = -1;

      this.debug(`[CLOSE]
    Event Code: ${event.code}
    Clean     : ${event.wasClean}
    Reason    : ${event.reason || 'No reason received'}`);

      this.setHeartbeatTimer(-1);
      this.setHelloTimeout(-1);
      // If we still have a connection object, clean up its listeners
      if (this.connection) this._cleanupConnection();

      this.status = Status.DISCONNECTED;

      /**
       * Emitted when a shard's WebSocket closes.
       * @private
       * @event WebSocketShard#close
       * @param {CloseEvent} event The received event
       */
      this.emit(ShardEvents.CLOSE, event);
    }

    checkReady() {
      // Step 0. Clear the ready timeout, if it exists
      if (this.readyTimeout) {
        this.manager.client._tii.clearTimeout(this.readyTimeout);
        this.readyTimeout = null;
      }
      // Step 1. If we don't have any other guilds pending, we are ready
      if (!this.expectedGuilds.size) {
        this.debug('Shard received all its guilds. Marking as fully ready.');
        this.status = Status.READY;

        /**
         * Emitted when the shard is fully ready.
         * This event is emitted if:
         * * all guilds were received by this shard
         * * the ready timeout expired, and some guilds are unavailable
         * @event WebSocketShard#allReady
         * @param {?Set<string>} unavailableGuilds Set of unavailable guilds, if any
         */
        this.emit(ShardEvents.ALL_READY);
        return;
      }
      // Step 2. Create a 15s timeout that will mark the shard as ready if there are still unavailable guilds
      this.readyTimeout = this.manager.client._tii.setTimeout(() => {
        this.debug(`Shard did not receive any more guild packets in 15 seconds.
  Unavailable guild count: ${this.expectedGuilds.size}`);

        this.readyTimeout = null;

        this.status = Status.READY;

        this.emit(ShardEvents.ALL_READY, this.expectedGuilds);
      }, 15000);
    }

    /**
     * Sets the HELLO packet timeout.
     * @param {number} [time] If set to -1, it will clear the hello timeout timeout
     * @private
     */
    setHelloTimeout(time) {
      if (time === -1) {
        if (this.helloTimeout) {
          this.debug('Clearing the HELLO timeout.');
          this.manager.client._tii.clearTimeout(this.helloTimeout);
          this.helloTimeout = null;
        }
        return;
      }
      this.debug('Setting a HELLO timeout for 20s.');
      this.helloTimeout = this.manager.client._tii.setTimeout(() => {
        this.debug('Did not receive HELLO in time. Destroying and connecting again.');
        this.destroy({ reset: true, closeCode: 4009 });
      }, 20000);
    }

    /**
     * Sets the heartbeat timer for this shard.
     * @param {number} time If -1, clears the interval, any other number sets an interval
     * @private
     */
    setHeartbeatTimer(time) {
      if (time === -1) {
        if (this.heartbeatInterval) {
          this.debug('Clearing the heartbeat interval.');
          this.manager.client._tii.clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }
        return;
      }
      this.debug(`Setting a heartbeat interval for ${time}ms.`);
      // Sanity checks
      if (this.heartbeatInterval) this.manager.client._tii.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = this.manager.client._tii.setInterval(() => this.sendHeartbeat(), time);
    }

    /**
     * Sends a heartbeat to the WebSocket.
     * If this shard didn't receive a heartbeat last time, it will destroy it and reconnect
     * @param {string} [tag='HeartbeatTimer'] What caused this heartbeat to be sent
     * @param {boolean} [ignoreHeartbeatAck] If we should send the heartbeat forcefully.
     * @private
     */
    sendHeartbeat(tag = 'HeartbeatTimer') {
      if (!this.lastHeartbeatAcked) {
        this.debug(`[${tag}] Didn't process heartbeat ack yet but we are still connected. Sending one now.`);
      } else if (!this.lastHeartbeatAcked) {
        this.debug(
          `[${tag}] Didn't receive a heartbeat ack last time, assuming zombie connection. Destroying and reconnecting.`
        );

        this.destroy({ closeCode: 4009, reset: true });
        return;
      }

      this.debug(`[${tag}] Sending a heartbeat.`);
      this.lastHeartbeatAcked = false;
      this.lastPingTimestamp = Date.now();
      this.send({ op: OpCodes.HEARTBEAT, d: this.sequence }, true);
    }

    /**
     * Acknowledges a heartbeat.
     * @private
     */
    ackHeartbeat() {
      this.lastHeartbeatAcked = true;
      const latency = Date.now() - this.lastPingTimestamp;
      this.debug(`Heartbeat acknowledged, latency of ${latency}ms.`);
      this.ping = latency;
    }

    /**
     * Identifies the client on the connection.
     * @private
     * @returns {void}
     */
    identify() {
      return this.sessionID ? this.identifyResume() : this.identifyNew();
    }

    /**
     * Identifies as a new connection on the gateway.
     * @private
     */
    identifyNew() {
      const { client } = this.manager;
      if (!client.token) {
        this.debug('[IDENTIFY] No token available to identify a new session.');
        return;
      }

      this.status = Status.IDENTIFYING;

 
      const d = {
        ...client.options.ws,
        intents: client.options.Intents,
        token: client.token,
        shard: [this.id, Number(client.options.shardCount)],
        properties: {
          $os: os.platform(),
          $browser: "jscord",
          $device: "jscord"
        },
      };

      this.debug(`[IDENTIFY] Shard ${this.id}/${client.options.shardCount}`);
      this.send({ op: OpCodes.IDENTIFY, d }, true);
    }

    /**
     * Resumes a session on the gateway.
     * @private
     */
    identifyResume() {
      if (!this.sessionID) {
        this.debug('[RESUME] No session ID was present; identifying as a new session.');
        this.identifyNew();
        return;
      }


      this.debug(`[RESUME] Session ${this.sessionID}, sequence ${this.closeSequence}`);
      this.status = Status.RESUMING;
      const d = {
        token: this.manager.client.token,
        session_id: this.sessionID,
        seq: this.closeSequence,
      };

      this.send({ op: OpCodes.RESUME, d }, true);
    }

    /**
     * Adds a packet to the queue to be sent to the gateway.
     * <warn>If you use this method, make sure you understand that you need to provide
     * a full [Payload](https://discord.com/developers/docs/topics/gateway#commands-and-events-gateway-commands).
     * Do not use this method if you don't know what you're doing.</warn>
     * @param {Object} data The full packet to send
     * @param {boolean} [important=false] If this packet should be added first in queue
     */
    send(data, important = false) {
      this.ratelimit.queue[important ? 'unshift' : 'push'](data);
      this.processQueue();
    }

    /**
     * Sends data, bypassing the queue.
     * @param {Object} data Packet to send
     * @returns {void}
     * @private
     */
    _send(data) {
      if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
        this.debug(`Tried to send packet '${JSON.stringify(data)}' but no WebSocket is available!`);
        this.destroy({ closeCode: 4000 });
        return;
      }
      let tosend = JSON.stringify(data)
      this.connection.send(tosend, err => {
        if (err) this.manager.client.emit(Events.SHARD_ERROR, err, this.id);
      });
    }

    /**
     * Processes the current WebSocket queue.
     * @returns {void}
     * @private
     */
    processQueue() {
      if (this.ratelimit.remaining === 0) return;
      if (this.ratelimit.queue.length === 0) return;
      if (this.ratelimit.remaining === this.ratelimit.total) {
        this.ratelimit.timer = this.manager.client._tii.setTimeout(() => {
          this.ratelimit.remaining = this.ratelimit.total;
          this.processQueue();
        }, this.ratelimit.time);
      }
      while (this.ratelimit.remaining > 0) {
        const item = this.ratelimit.queue.shift();
        if (!item) return;
        this._send(item);
        this.ratelimit.remaining--;
      }
    }

    /**
     * Destroys this shard and closes its WebSocket connection.
     * @param {Object} [options={ closeCode: 1000, reset: false, emit: true, log: true }] Options for destroying the shard
     * @private
     */
    destroy({ closeCode = 1000, reset = false, emit = true, log = true } = {}) {
      if (log) {
        this.debug(`[DESTROY]
    Close Code    : ${closeCode}
    Reset         : ${reset}
    Emit DESTROYED: ${emit}`);
      }

      // Step 0: Remove all timers
      this.setHeartbeatTimer(-1);
      this.setHelloTimeout(-1);

      // Step 1: Close the WebSocket connection, if any, otherwise, emit DESTROYED
      if (this.connection) {
        // If the connection is currently opened, we will (hopefully) receive close
        if (this.connection.readyState === WebSocket.OPEN) {
          this.connection.close(closeCode);
        } else {
          // Connection is not OPEN
          this.debug(`WS State: ${CONNECTION_STATE[this.connection.readyState]}`);
          // Remove listeners from the connection
          this._cleanupConnection();
          // Attempt to close the connection just in case
          try {
            this.connection.close(closeCode);
          } catch {
            // No-op
          }
          // Emit the destroyed event if needed
          if (emit) this._emitDestroyed();
        }
      } else if (emit) {
        // We requested a destroy, but we had no connection. Emit destroyed
        this._emitDestroyed();
      }

      // Step 2: Null the connection object
      this.connection = null;

      // Step 3: Set the shard status to DISCONNECTED
      this.status = Status.DISCONNECTED;

      // Step 4: Cache the old sequence (use to attempt a resume)
      if (this.sequence !== -1) this.closeSequence = this.sequence;

      // Step 5: Reset the sequence and session ID if requested
      if (reset) {
        this.sequence = -1;
        this.sessionID = null;
      }

      // Step 6: reset the ratelimit data
      this.ratelimit.remaining = this.ratelimit.total;
      this.ratelimit.queue.length = 0;
      if (this.ratelimit.timer) {
        this.manager.client._tii.clearTimeout(this.ratelimit.timer);
        this.ratelimit.timer = null;
      }
    }

    /**
     * Cleans up the WebSocket connection listeners.
     * @private
     */
    _cleanupConnection() {
      this.connection.onopen = this.connection.onclose = this.connection.onerror = this.connection.onmessage = null;
    }

    /**
     * Emits the DESTROYED event on the shard
     * @private
     */
    _emitDestroyed() {
      /**
       * Emitted when a shard is destroyed, but no WebSocket connection was present.
       * @private
       * @event WebSocketShard#destroyed
       */
      this.emit(ShardEvents.DESTROYED);
    }

  }

module.exports = {
  ShardWebSocket
}