export const WebsocketEvent = {
    DISPATCH: 0,
    Heartbeat: 1,
    Identify: 2,
    Presence_Update: 3,
    Voice_State_Update: 4,
    Resume: 6,
    Reconnect: 7,
    Request_Guild_Members: 8,
    Invalid_Session: 9,
    Hello: 10,
    Heartbeat_ACK: 11,
}

export enum WSstatus {
    WAITING_FOR_GUILDS = 0,
    READY = 1,
    IDLE = 2,
}

export enum Events {
    READY = 'ready',
    RESUMED = 'resume',
    RECONNECT = 'recoonect',
    INVALID_SESSION = 'InvalidSession',
    CHANNEL_CREATE = 'ChannelCreate',
    CHANNEL_UPDATE = 'ChannelUpdate',
    CHANNEL_DELETED = 'ChannelDeleted',
    CHANNEL_PINS_UPDATED = 'ChannelPinsUpdated',
    GUILD_Create = 'GuildCreate',
    GUILD_UPDATE = 'GuildUpdate',
    GUILD_DELETE = 'GuildDelete',
    GUILD_BAN_ADD = 'GuildBanAdd',
    GUILD_BAN_REMOVE = 'GuildBanRemove',
    GUILD_EMOJIS_UPDATE = 'GuildEmojisUpdate',
    GUILD_MEMBER_ADD = 'GuildMemberAdd',
    GUILD_MEMBER_UPDATE = 'GuildMemberUpdate',
    GUILD_MEMBER_REMOVE = 'GuildMemberRemove',
    GUILD_MEMBERS_CHUNK = 'GuildMembersChunk',
    DEBUG = 'debug',
    ERROR = 'error',
    MESSAGE_CREATE = 'message,'
}

export interface Payload {
    op: number;
    t: string;
    s: number;
    d: any;
}

export enum Constants {
    GATEWAY = `wss://gateway.discord.gg/?v=8&encoding=json`,
    API = `https://discord.com/api/v8`
}

export enum OPCODES {
    ZERO = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
    NINE = 9,
    TEN = 10,
    ELEVEN = 11,
    TWELVE = 12,
}

export enum CLOSEDCODES {
    NOTOKEN = 4004,
}

export enum Endpoints {
    USERS = 'users',
    USERS_GUILDS = 'users/@me/guilds',
    GUILDS = 'guilds',
    COMMANDS = 'applications/<my_application_id>/guilds/764545184653901825/commands'
}

export const headers = {
    'Content-Type': 'application/json',
    'Authorization': '',
}