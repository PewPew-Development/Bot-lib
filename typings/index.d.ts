declare module "bot-lib" {
    import { ChildProcess } from "child_process";
    import * as WebSocket from 'ws';
    import { EventEmitter } from 'events';

    export class BaseClient extends EventEmitter {

    }

    export class Client extends BaseClient {
        constructor(options?: ClientOptions);

        public ready: boolean;
        public ws: WebSocketManager
        public readonly options: ClientOptions
        public login(token?: string): Promise<void>

        public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof ClientEvents>,
            listener: (...args: any[]) => void,
        ): this;

        public once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
        public once<S extends string | symbol>(
            event: Exclude<S, keyof ClientEvents>,
            listener: (...args: any[]) => void,
        ): this;

        public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
        public emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: any[]): boolean;

        public off<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
        public off<S extends string | symbol>(
            event: Exclude<S, keyof ClientEvents>,
            listener: (...args: any[]) => void,
        ): this;

        public removeAllListeners<K extends keyof ClientEvents>(event?: K): this;
        public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ClientEvents>): this;
    }

    export class WebSocketManager extends EventEmitter {
        private expectedGuilds: Set<string>
        private heartbeatInterval: any;
        private closeSequence: number;
        private packetQueue: Array<any>
        private lastSequence: number | null;
        private seq: number;
        //public status: WSstatus
        public ping: number | null;
        private receivedAck: boolean;
        private lastPingTimestamp: any
        private lastHeartbeatAcked: boolean;
        private sessionID: string | null;
        private ratelimit: any
        client: Client;
    }

    interface ClientOptions {
        token?: string | null;
        presence?: object | {};
        reconnect?: boolean | false;
        cachedGuilds?: boolean | false;
        intents?: Array<IntentsString>;
    }

    type IntentsString =
        | 'GUILDS'
        | 'GUILD_MEMBERS'
        | 'GUILD_BANS'
        | 'GUILD_EMOJIS'
        | 'GUILD_INTEGRATIONS'
        | 'GUILD_WEBHOOKS'
        | 'GUILD_INVITES'
        | 'GUILD_VOICE_STATES'
        | 'GUILD_PRESENCES'
        | 'GUILD_MESSAGES'
        | 'GUILD_MESSAGE_REACTIONS'
        | 'GUILD_MESSAGE_TYPING'
        | 'DIRECT_MESSAGES'
        | 'DIRECT_MESSAGE_REACTIONS'
        | 'DIRECT_MESSAGE_TYPING';

    interface ClientEvents {
        ready: [];
        debug: [message: string];
    }
}