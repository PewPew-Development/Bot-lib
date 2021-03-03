const { VerificationLevels, ExplicitContentFilterLevels, DefaultMessageNotifications } = require('../Constants/Constants')
const { SystemChannelFlags } = require('../utils/systemchannelflags')
class Guild {
    constructor(client, data) {
        super(client);


        this.members = new GuildMemberManager(this);

        this.channels = new GuildChannelManager(this);

        this.roles = new RoleManager(this);

        this.presences = new PresenceManager(this.client);

        this.voiceStates = new VoiceStateManager(this);

        this.deleted = false;

        if (!data) return;
        if (data.unavailable) {

            this.available = false;

            this.id = data.id;
        } else {
            this._patch(data);
            if (!data.channels) this.available = false;
        }

        this.shardID = data.shardID;
    }

    get shard() {
        return this.client.ws.shards.get(this.shardID);
    }


    _patch(data) {

        this.name = data.name;

        this.icon = data.icon;

        this.splash = data.splash;

        this.discoverySplash = data.discovery_splash;

        this.region = data.region;

        this.memberCount = data.member_count || this.memberCount;

        this.large = Boolean('large' in data ? data.large : this.large);

        this.features = data.features;

        this.applicationID = data.application_id;

        this.afkTimeout = data.afk_timeout;

        this.afkChannelID = data.afk_channel_id;

        this.systemChannelID = data.system_channel_id;

        this.premiumTier = data.premium_tier;

        if (typeof data.premium_subscription_count !== 'undefined') {

            this.premiumSubscriptionCount = data.premium_subscription_count;
        }

        if (typeof data.widget_enabled !== 'undefined') {

            this.widgetEnabled = data.widget_enabled;
        }

        if (typeof data.widget_channel_id !== 'undefined') {

            this.widgetChannelID = data.widget_channel_id;
        }

        this.verificationLevel = VerificationLevels[data.verification_level];

        this.explicitContentFilter = ExplicitContentFilterLevels[data.explicit_content_filter];

        this.mfaLevel = data.mfa_level;

        this.joinedTimestamp = data.joined_at ? new Date(data.joined_at).getTime() : this.joinedTimestamp;


        this.defaultMessageNotifications =
            DefaultMessageNotifications[data.default_message_notifications] || data.default_message_notifications;

        this.systemChannelFlags = new SystemChannelFlags(data.system_channel_flags).freeze();
        

        if (typeof data.max_members !== 'undefined') {
 
            this.maximumMembers = data.max_members;
        } else if (typeof this.maximumMembers === 'undefined') {
            this.maximumMembers = null;
        }

        if (typeof data.max_presences !== 'undefined') {

            this.maximumPresences = data.max_presences || 25000;
        } else if (typeof this.maximumPresences === 'undefined') {
            this.maximumPresences = null;
        }

        if (typeof data.approximate_member_count !== 'undefined') {

            this.approximateMemberCount = data.approximate_member_count;
        } else if (typeof this.approximateMemberCount === 'undefined') {
            this.approximateMemberCount = null;
        }

        if (typeof data.approximate_presence_count !== 'undefined') {

            this.approximatePresenceCount = data.approximate_presence_count;
        } else if (typeof this.approximatePresenceCount === 'undefined') {
            this.approximatePresenceCount = null;
        }


        this.vanityURLCode = data.vanity_url_code;

 
        this.vanityURLUses = null;

        this.description = data.description;

        this.banner = data.banner;

        this.id = data.id;
        this.available = !data.unavailable;
        this.features = data.features || this.features || [];


        this.rulesChannelID = data.rules_channel_id;


        this.publicUpdatesChannelID = data.public_updates_channel_id;

        this.preferredLocale = data.preferred_locale;

        /*if (data.channels) {
            this.channels.cache.clear();
            for (const rawChannel of data.channels) {
                this.client.channels.add(rawChannel, this);
            }
        }

        if (data.roles) {
            this.roles.cache.clear();
            for (const role of data.roles) this.roles.add(role);
        }

        if (data.members) {
            this.members.cache.clear();
            for (const guildUser of data.members) this.members.add(guildUser);
        }*/

        if (data.owner_id) {

            this.ownerID = data.owner_id;
        }

        /*if (data.presences) {
            for (const presence of data.presences) {
                this.presences.add(Object.assign(presence, { guild: this }));
            }
        }

        if (data.voice_states) {
            this.voiceStates.cache.clear();
            for (const voiceState of data.voice_states) {
                this.voiceStates.add(voiceState);
            }
        }

        if (!this.emojis) {
            /**
             * A manager of the emojis belonging to this guild
             * @type {GuildEmojiManager}
             */
           /* this.emojis = new GuildEmojiManager(this);
            if (data.emojis) for (const emoji of data.emojis) this.emojis.add(emoji);
        } else if (data.emojis) {
            this.client.actions.GuildEmojisUpdate.handle({
                guild_id: this.id,
                emojis: data.emojis,
            });
        }*/
    }
}