const os = require('os');

exports.Constants = {
    GATEWAY: `wss://gateway.discord.gg/?v=8&encoding=json`,
    API: `https://discord.com/api/v8`
}

exports.Opcodes = {
    Zero: 0,
    One: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9,
    Ten: 10,
    Eleven: 11,
    Twelve: 12,
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
    DEBUG: 'debug',
}
exports.ShardEvents = {
    
}