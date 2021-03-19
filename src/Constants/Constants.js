const os = require('os');

exports.Constants = {
    GATEWAY: `wss://gateway.discord.gg/?v=8&encoding=json`,
    API: `https://discord.com/api/v8`
}


exports.Heartbeat = {
    op: 1,
    d: null,
}

exports.Identify = {
    "op": 2,
    "d": {
        "token": "",
        "properties": {
            "$os": os.platform(),
            "$browser": "jscord",
            "$device": "jscord"
        }
    }
}

exports.Events = {
    RATE_LIMIT: 'rateLimit',
    CLIENT_READY: 'ready',
    GUILD_CREATE: 'guildCreate',
    GUILD_DELETE: 'guildDelete',
    GUILD_UPDATE: 'guildUpdate',
    GUILD_UNAVAILABLE: 'guildUnavailable',
    GUILD_AVAILABLE: 'guildAvailable',
    GUILD_MEMBER_ADD: 'guildMemberAdd',
    GUILD_MEMBER_REMOVE: 'guildMemberRemove',
    GUILD_MEMBER_UPDATE: 'guildMemberUpdate',
    GUILD_MEMBER_AVAILABLE: 'guildMemberAvailable',
    GUILD_MEMBER_SPEAKING: 'guildMemberSpeaking',
    GUILD_MEMBERS_CHUNK: 'guildMembersChunk',
    GUILD_INTEGRATIONS_UPDATE: 'guildIntegrationsUpdate',
    GUILD_ROLE_CREATE: 'roleCreate',
    GUILD_ROLE_DELETE: 'roleDelete',
    INVITE_CREATE: 'inviteCreate',
    INVITE_DELETE: 'inviteDelete',
    GUILD_ROLE_UPDATE: 'roleUpdate',
    GUILD_EMOJI_CREATE: 'emojiCreate',
    GUILD_EMOJI_DELETE: 'emojiDelete',
    GUILD_EMOJI_UPDATE: 'emojiUpdate',
    GUILD_BAN_ADD: 'guildBanAdd',
    GUILD_BAN_REMOVE: 'guildBanRemove',
    CHANNEL_CREATE: 'channelCreate',
    CHANNEL_DELETE: 'channelDelete',
    CHANNEL_UPDATE: 'channelUpdate',
    CHANNEL_PINS_UPDATE: 'channelPinsUpdate',
    MESSAGE_CREATE: 'message',
    MESSAGE_DELETE: 'messageDelete',
    MESSAGE_UPDATE: 'messageUpdate',
    MESSAGE_BULK_DELETE: 'messageDeleteBulk',
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
    MESSAGE_REACTION_REMOVE_ALL: 'messageReactionRemoveAll',
    MESSAGE_REACTION_REMOVE_EMOJI: 'messageReactionRemoveEmoji',
    USER_UPDATE: 'userUpdate',
    PRESENCE_UPDATE: 'presenceUpdate',
    VOICE_SERVER_UPDATE: 'voiceServerUpdate',
    VOICE_STATE_UPDATE: 'voiceStateUpdate',
    VOICE_BROADCAST_SUBSCRIBE: 'subscribe',
    VOICE_BROADCAST_UNSUBSCRIBE: 'unsubscribe',
    TYPING_START: 'typingStart',
    TYPING_STOP: 'typingStop',
    WEBHOOKS_UPDATE: 'webhookUpdate',
    ERROR: 'error',
    WARN: 'warn',
    DEBUG: 'debug',
    SHARD_DISCONNECT: 'shardDisconnect',
    SHARD_ERROR: 'shardError',
    SHARD_RECONNECTING: 'shardReconnecting',
    SHARD_READY: 'shardReady',
    SHARD_RESUME: 'shardResume',
    INVALIDATED: 'invalidated',
    RAW: 'raw',
}

exports.ShardEvents = {
    CLOSE: 'close',
    DESTROYED: 'destroyed',
    INVALID_SESSION: 'invalidSession',
    READY: 'ready',
    RESUMED: 'resumed',
    ALL_READY: 'allReady',
    SHARDREADY: 'shardReady',
    SHARDCREATE: 'shardCreate',
};

exports.OpCodes = {
    DISPATCH: 0,
    HEARTBEAT: 1,
    IDENTIFY: 2,
    STATUS_UPDATE: 3,
    VOICE_STATE_UPDATE: 4,
    VOICE_GUILD_PING: 5,
    RESUME: 6,
    RECONNECT: 7,
    REQUEST_GUILD_MEMBERS: 8,
    INVALID_SESSION: 9,
    HELLO: 10,
    HEARTBEAT_ACK: 11,
};

exports.WSCodes = {
    1000: 'WS_CLOSE_REQUESTED',
    4004: 'TOKEN_INVALID',
    4010: 'SHARDING_INVALID',
    4011: 'SHARDING_REQUIRED',
    4013: 'INVALID_INTENTS',
    4014: 'DISALLOWED_INTENTS',
};

exports.Status = {
    READY: 0,
    CONNECTING: 1,
    RECONNECTING: 2,
    IDLE: 3,
    NEARLY: 4,
    DISCONNECTED: 5,
    WAITING_FOR_GUILDS: 6,
    IDENTIFYING: 7,
    RESUMING: 8,
};

exports.ExplicitContentFilterLevels = ['DISABLED', 'MEMBERS_WITHOUT_ROLES', 'ALL_MEMBERS'];

exports.DefaultMessageNotifications = ['ALL', 'MENTIONS'];

exports.VerificationLevels = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

exports.WSEvents = keyMirror([
    'READY',
    'RESUMED',
    'GUILD_CREATE',
    'GUILD_DELETE',
    'GUILD_UPDATE',
    'INVITE_CREATE',
    'INVITE_DELETE',
    'GUILD_MEMBER_ADD',
    'GUILD_MEMBER_REMOVE',
    'GUILD_MEMBER_UPDATE',
    'GUILD_MEMBERS_CHUNK',
    'GUILD_INTEGRATIONS_UPDATE',
    'GUILD_ROLE_CREATE',
    'GUILD_ROLE_DELETE',
    'GUILD_ROLE_UPDATE',
    'GUILD_BAN_ADD',
    'GUILD_BAN_REMOVE',
    'GUILD_EMOJIS_UPDATE',
    'CHANNEL_CREATE',
    'CHANNEL_DELETE',
    'CHANNEL_UPDATE',
    'CHANNEL_PINS_UPDATE',
    'MESSAGE_CREATE',
    'MESSAGE_DELETE',
    'MESSAGE_UPDATE',
    'MESSAGE_DELETE_BULK',
    'MESSAGE_REACTION_ADD',
    'MESSAGE_REACTION_REMOVE',
    'MESSAGE_REACTION_REMOVE_ALL',
    'MESSAGE_REACTION_REMOVE_EMOJI',
    'USER_UPDATE',
    'PRESENCE_UPDATE',
    'TYPING_START',
    'VOICE_STATE_UPDATE',
    'VOICE_SERVER_UPDATE',
    'WEBHOOKS_UPDATE',
]);


function keyMirror(arr) {
    let tmp = Object.create(null);
    for (const value of arr) tmp[value] = value;
    return tmp;
}

exports.Errors = {
    INVALID_INTENT: `The intent ${int} is an invalid intent!`
}