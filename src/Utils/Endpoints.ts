
export class Endpoints {

    /*
        REST Endpoints
    */

    static CHANNEL = (channel: string): string => `/channels/${channel}`;
    static CHANNEL_BULK_DELETE = (channel: string): string => `/channels/${channel}/messages/bulk-delete`;
    static CHANNEL_CALL_RING = (channel: string): string => `/channels/${channel}/call/ring`;
    static CHANNEL_CROSSPOST = (channel: string, message: string): string => `/channels/${channel}/messages/${message}/crosspost`;
    static CHANNEL_FOLLOW = (channel: string): string => `/channels/${channel}/followers`;
    static CHANNEL_INVITES = (channel: string): string => `/channels/${channel}/invites`;
    static CHANNEL_MESSAGE_REACTION = (channel: string, message: string, reaction: string): string => `/channels/${channel}/messages/${message}/reactions/${reaction}`;
    static CHANNEL_MESSAGE_REACTION_USER = (channel: string, message: string, reaction: string, user: string): string => `/channels/${channel}/messages/${message}/reactions/${reaction}/${user}`;
    static CHANNEL_MESSAGE_REACTIONS = (channel: string, message: string): string => `/channels/${channel}/messages/${message}/reactions`;
    static CHANNEL_MESSAGE = (channel: string, message: string): string => `/channels/${channel}/messages/${message}`;
    static CHANNEL_MESSAGES = (channel: string): string => `/channels/${channel}/messages`;
    static CHANNEL_MESSAGES_SEARCH = (channel: string): string => `/channels/${channel}/messages/search`;
    static CHANNEL_PERMISSION = (channel: string, override: string): string => `/channels/${channel}/permissions/${override}`;
    static CHANNEL_PERMISSIONS = (channel: string): string => `/channels/${channel}/permissions`;
    static CHANNEL_PIN = (channel: string, message: string): string => `/channels/${channel}/pins/${message}`;
    static CHANNEL_PINS = (channel: string): string => `/channels/${channel}/pins`;
    static CHANNEL_RECIPIENT = (group: string, user: string): string => `/channels/${group}/recipients/${user}`;
    static CHANNEL_TYPING = (channel: string): string => `/channels/${channel}/typing`;
    static CHANNEL_WEBHOOKS = (channel: string): string => `/channels/${channel}/webhooks`;
    static CHANNELS = (): string => "/channels";
    static GATEWAY = (): string => "/gateway";
    static GATEWAY_BOT = (): string => "/gateway/bot";
    static GUILD = (guild: string): string => `/guilds/${guild}`;
    static GUILD_AUDIT_LOGS = (guild: string): string => `/guilds/${guild}/audit-logs`;
    static GUILD_BAN = (guild: string, member: string): string => `/guilds/${guild}/bans/${member}`;
    static GUILD_BANS = (guild: string): string => `/guilds/${guild}/bans`;
    static GUILD_CHANNELS = (guild: string): string => `/guilds/${guild}/channels`;
    static GUILD_EMBED = (guild: string): string => `/guilds/${guild}/embed`;
    static GUILD_EMOJI = (guild: string, emoji: string): string => `/guilds/${guild}/emojis/${emoji}`;
    static GUILD_EMOJIS = (guild: string): string => `/guilds/${guild}/emojis`;
    static GUILD_INTEGRATION = (guild: string, integration: string): string => `/guilds/${guild}/integrations/${integration}`;
    static GUILD_INTEGRATION_SYNC = (guild: string, integration: string): string => `/guilds/${guild}/integrations/${integration}/sync`;
    static GUILD_INTEGRATIONS = (guild: string): string => `/guilds/${guild}/integrations`;
    static GUILD_INVITES = (guild: string): string => `/guilds/${guild}/invites`;
    static GUILD_VANITY_URL = (guild: string): string => `/guilds/${guild}/vanity-url`;
    static GUILD_MEMBER = (guild: string, member: string): string => `/guilds/${guild}/members/${member}`;
    static GUILD_MEMBER_NICK = (guild: string, member: string): string => `/guilds/${guild}/members/${member}/nick`;
    static GUILD_MEMBER_ROLE = (guild: string, member: string, role: string): string => `/guilds/${guild}/members/${member}/roles/${role}`;
    static GUILD_MEMBERS = (guild: string): string => `/guilds/${guild}/members`;
    static GUILD_MEMBERS_SEARCH = (guild: string): string => `/guilds/${guild}/members/search`;
    static GUILD_MESSAGES_SEARCH = (guild: string): string => `/guilds/${guild}/messages/search`;
    static GUILD_PREVIEW = (guild: string): string => `/guilds/${guild}/preview`;
    static GUILD_PRUNE = (guild: string): string => `/guilds/${guild}/prune`;
    static GUILD_ROLE = (guild: string, role: string): string => `/guilds/${guild}/roles/${role}`;
    static GUILD_ROLES = (guild: string): string => `/guilds/${guild}/roles`;
    static GUILD_VOICE_REGIONS = (guild: string): string => `/guilds/${guild}/regions`;
    static GUILD_WEBHOOKS = (guild: string): string => `/guilds/${guild}/webhooks`;
    static GUILD_WIDGET = (guild: string): string => `/guilds/${guild}/widget`;
    static GUILDS = () => "/guilds";
    static INVITE = (invite: string): string => `/invite/${invite}`;
    static OAUTH2_APPLICATION = (application: string): string => `/oauth2/applications/${application}`;
    static USER = (user: string): string => `/users/${user}`;
    static USER_CHANNELS = (user: string): string => `/users/${user}/channels`;
    static USER_CONNECTIONS = (user: string): string => `/users/${user}/connections`;
    static USER_GUILD = (user: string, guild: string): string => `/users/${user}/guilds/${guild}`;
    static USER_GUILDS = (user: string): string => `/users/${user}/guilds`;
    static USER_PROFILE = (user: string): string => `/users/${user}/profile`;
    static USER_SETTINGS = (user: string): string => `/users/${user}/settings`;
    static USERS = (): string => "/users";
    static VOICE_REGIONS = (): string => "/voice/regions";
    static WEBHOOK = (hook: string): string => `/webhooks/${hook}`;
    static WEBHOOK_SLACK = (hook: string): string => `/webhooks/${hook}/slack`;
    static WEBHOOK_TOKEN = (hook: string, hook_token: string): string => `/webhooks/${hook}/${hook_token}`;
    static WEBHOOK_TOKEN_SLACK = (hook: string, hook_token: string): string => `/webhooks/${hook}/${hook_token}/slack`


    /*
        Client Endpoints
    */

    static MESSAGE_LINK = (guild: string, channel: string, message: string) => `/channels/${guild}/${channel}/${message}`;

    /*
        CDN Endpoints
    */

    static CHANNEL_ICON = (channel: string, icon: string) => `/channel-icons/${channel}/${icon}`;
    static CUSTOM_EMOJI = (emoji: string) => `/emojis/${emoji}`;
    static DEFAULT_USER_AVATAR = (discriminator: string) => `/embed/avatars/${discriminator}`;
    static GUILD_BANNER = (guild: string, banner: string) => `/banners/${guild}/${banner}`;
    static GUILD_DISCOVERY_SPLASH = (guild: string, discovery_splash: string) => `/discovery-splashes/${guild}/${discovery_splash}`;
    static GUILD_ICON = (guild: string, guild_icon: string) => `/icons/${guild}/${guild_icon}`;
    static GUILD_SPLASH = (guild: string, splash: string) => `/splashes/${guild}/${splash}`;
    static USER_AVATAR = (user: string, avatar: string) => `/avatars/${user}/${avatar}`;
}