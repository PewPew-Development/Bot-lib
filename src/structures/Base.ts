import { Client } from "../client/Client";

export class Base {
    public client: Client
    constructor(client: Client) {
        /**
         * The client that instantiated this
         * @name Base#client
         * @type {Client}
         * @readonly
         */
        this.client = client
    }

    _clone() {
        return Object.assign(Object.create(this), this);
    }

    _patch(data: any) {
        return data;
    }

    _update(data: any) {
        const clone = this._clone();
        this._patch(data);
        return clone;
    }
}