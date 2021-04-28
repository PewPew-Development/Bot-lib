import { EventEmitter } from "events"

export class BaseBotClient extends EventEmitter {
    public _timeouts: Set<any>
    public _intervals: Set<any>
    public _immediates: Set<any>

    constructor(options: BotClientOptions = {}) {
        super();

        this._timeouts = new Set()
        this._intervals = new Set()
        this._immediates = new Set()

    }
    destroy() {
        for (const t of this._timeouts) this.clearTimeout(t)
        for (const i of this._intervals) this.clearInterval(i)
        for (const t of this._timeouts) this.clearTimeout(t);
        for (const i of this._intervals) this.clearInterval(i);
        for (const i of this._immediates) this.clearImmediate(i);
        this._timeouts.clear();
        this._intervals.clear();
        this._immediates.clear()
    }

    setTimeout(fn: any, delay: any, ...args: any) {
        const timeout = setTimeout(() => {
            fn(...args);
            this._timeouts.delete(timeout);
        }, delay);
        this._timeouts.add(timeout);
        return timeout;
    }

    /**
     * Clears a timeout.
     * @param {Timeout} timeout Timeout to cancel
     */
    clearTimeout(timeout: any) {
        clearTimeout(timeout);
        this._timeouts.delete(timeout);
    }

    /**
     * Sets an interval that will be automatically cancelled if the client is destroyed.
     * @param {Function} fn Function to execute
     * @param {number} delay Time to wait between executions (in milliseconds)
     * @param {...*} args Arguments for the function
     * @returns {Timeout}
     */
    setInterval(fn: any, delay: any, ...args: any) {
        const interval = setInterval(fn, delay, ...args);
        this._intervals.add(interval);
        return interval;
    }

    /**
     * Clears an interval.
     * @param {Timeout} interval Interval to cancel
     */
    clearInterval(interval: any) {
        clearInterval(interval);
        this._intervals.delete(interval);
    }

    /**
     * Sets an immediate that will be automatically cancelled if the client is destroyed.
     * @param {Function} fn Function to execute
     * @param {...*} args Arguments for the function
     * @returns {Immediate}
     */
    setImmediate(fn: any, ...args: any) {
        const immediate = setImmediate(fn, ...args);
        this._immediates.add(immediate);
        return immediate;
    }

    /**
     * Clears an immediate.
     * @param {Immediate} immediate Immediate to cancel
     */
    clearImmediate(immediate: any) {
        clearImmediate(immediate);
        this._immediates.delete(immediate);
    }

    /**
     * Increments max listeners by one, if they are not zero.
     * @private
     */
    incrementMaxListeners() {
        const maxListeners = this.getMaxListeners();
        if (maxListeners !== 0) {
            this.setMaxListeners(maxListeners + 1);
        }
    }

    /**
     * Decrements max listeners by one, if they are not zero.
     * @private
     */
    decrementMaxListeners() {
        const maxListeners = this.getMaxListeners();
        if (maxListeners !== 0) {
            this.setMaxListeners(maxListeners - 1);
        }
    }
}

export interface BotClientOptions {
    token?: string;
}