exports.ClientErrors = {
    INVALID_TOKEN: '[INVALID_TOKEN] The token you provided is invalid!',
    INVALID_INTENT: '[INVALID_INTENT] One of the intent you provided in invalid!',
    MISSING_TOKEN: '[TOKEN_MISSING] You didn\'t provide your bot\'s token on the login method',
    TOKEN_NOT_STRING: '[INVALID_TOKEN] The token you provided is not s string!',
}

exports.ShardmanErrors = {
    BOT_FILE_MISSING: '[BOT_FILE_MISSING] You need to provide a file for your bot!',
    NOT_A_FILE: '[FILE_ERROR] File provided is not a valid file!',
    INVALID_AMOUNT_TOSPAWN: '[INVALID_AMOUNT] The value for shardstospawn must be a number!',
    MUST_BE_MORETHANONE: '[INVALID_AMOUNT] The number of shards to spawn must be higher than zero or auto!',
    MUST_BE_A_INTERGER: '[INVALID_AMOUNT] The number of shards to spawn must an interger!',
    INVALID_MODE: '[INVALID_MODE] The mode must either be \'process\' or \'worker\'',
}