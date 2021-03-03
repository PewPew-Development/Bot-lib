const { EventEmitter } = require('events')
const RestManager = require('../rest/RequestHandler');
const { Tiimanager } = require('../Constants/Options');

class TiiManager extends EventEmitter {
    constructor(options = {}) {
        super();

        Object.assign(TiiManager, options)

        this._timeouts = new Set();

        this._intervals = new Set()

        this._immediates = new Set();

        this.rest = new RestManager.RequestHandler(this)
    }

    destroy() {
        for (const t of this._timeouts) this.clearTimeout(t);
        for (const i of this._intervals) this.clearInterval(i);
        for (const i of this._immediates) this.clearImmediate(i);
        this._timeouts.clear();
        this._intervals.clear();
        this._immediates.clear();
    }

    setTimeout(fn, delay, ...args) {
        const timeout = setTimeout(() => {
            fn(...args);
            this._timeouts.delete(timeout);
        }, delay);
        this._timeouts.add(timeout);
        return timeout;
    }

    clearTimeout(timeout) {
        clearTimeout(timeout);
        this._timeouts.delete(timeout);
    }

    setInterval(fn, delay, ...args) {
        const interval = setInterval(fn, delay, ...args);
        this._intervals.add(interval);
        return interval;
    }

    clearInterval(interval) {
        clearInterval(interval);
        this._intervals.delete(interval);
    }

    setImmediate(fn, ...args) {
        const immediate = setImmediate(fn, ...args);
        this._immediates.add(immediate);
        return immediate;
    }

    clearImmediate(immediate) {
        clearImmediate(immediate);
        this._immediates.delete(immediate);
    }

    incrementMaxListeners() {
        const maxListeners = this.getMaxListeners();
        if (maxListeners !== 0) {
            this.setMaxListeners(maxListeners + 1);
        }
    }

    decrementMaxListeners() {
        const maxListeners = this.getMaxListeners();
        if (maxListeners !== 0) {
            this.setMaxListeners(maxListeners - 1);
        }
    }
}

module.exports = {
    TiiManager
}