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
    CLOSED = 3,
    DISCONNECTED = 4,
    RECONNECTING = 5,
}

export enum Events {
    READY = 'ready',
    DISCONNECTED = 'disconnected',
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

export enum Colors {
    DEFAULT = 0x000000,
    WHITE = 0xffffff,
    AQUA = 0x1abc9c,
    GREEN = 0x2ecc71,
    BLUE = 0x3498db,
    YELLOW = 0xffff00,
    PURPLE = 0x9b59b6,
    LUMINOUS_VIVID_PINK = 0xe91e63,
    GOLD = 0xf1c40f,
    ORANGE = 0xe67e22,
    RED = 0xe74c3c,
    GREY = 0x95a5a6,
    NAVY = 0x34495e,
    DARK_AQUA = 0x11806a,
    DARK_GREEN = 0x1f8b4c,
    DARK_BLUE = 0x206694,
    DARK_PURPLE = 0x71368a,
    DARK_VIVID_PINK = 0xad1457,
    DARK_GOLD = 0xc27c0e,
    DARK_ORANGE = 0xa84300,
    DARK_RED = 0x992d22,
    DARK_GREY = 0x979c9f,
    DARKER_GREY = 0x7f8c8d,
    LIGHT_GREY = 0xbcc0c0,
    DARK_NAVY = 0x2c3e50,
    BLURPLE = 0x7289da,
    GREYPLE = 0x99aab5,
    DARK_BUT_NOT_BLACK = 0x2c2f33,
    NOT_QUITE_BLACK = 0x23272a,
};

export interface Payload {
    op: number;
    t: string;
    s: number;
    d: any;
}

export enum Urls {
    Base = "/api/v",
    CDN = "https://cdn.discordapp.com",
    Client = "discord.com"
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
    Authentication_failed = 4004,
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