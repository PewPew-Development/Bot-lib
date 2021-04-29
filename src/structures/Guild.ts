import { BotClient } from "../client/Client";
import { Base } from "./BAse";

export class Guild extends Base {
    public id: string;
    public name: string;
    public icon: string;
    public description: string;
    public splash: string;
    public discoverySplash: string;
    public features: Array<any>;
    public emojis: Array<any>;
    public banner: string;
    public ownerID: string;
    public applicationID: string;
    public region: string;
    public afkChannelID: string;
    public afkTimeout: number;
    public systemChannelID: string;
    public widgetEnabled: boolean;
    public widgetChannelID: string;
    public verificationLevel: number;
    //public roles: Map<string, Role>,
    public defaultMessageNotifications: number;
    public mfaLevel: number;
    public explicitContentFilter: number;
    public MaxPresences: number;
    public MaxMembers: number;
    public client: BotClient
    public MaxVideoChannelUsers: number;
    public vanityUrlCode: string;
    public premiumTier: number;
    public premiumSubscriptionCount: number;
    public SytemChannelFlags: number;
    public preferredLocale: string;
    public rulesChannelID: string;
    public publicUpdatesChannelID: string;
    public available: boolean;
    public shardID: number;
    public nsfw: boolean;
    public memberCount: number;
    public large: boolean;
    public joinedTimestamp: number;
    public maximumMembers: number | null;
    public maximumPresences: number | null;
    public approximateMemberCount: number | null;
    public approximatePresenceCount: number | null
    public vanityURLCode: string;
    public vanityURLUses: number | null;


    constructor(client: BotClient, data: any) {
        super(client);

        this.client = client
        if (!data) return
        if (data.unavailable) {

        } else {
            this._patch(data);
            if (!data.channels) this.available = false;
        }


        /**
         * The id of the shard this Guild belongs to.
         * @type {number}
         */
        this.shardID = data.shardID;

        if ('nsfw' in data) {
            /**
             * Whether the guild is designated as not safe for work
             * @type {boolean}
             */
            this.nsfw = data.nsfw;
        }
    }
    get shard() {
        return this.client.shard
    }
    _patch(data: any) {
        /**
    * The name of the guild
    * @type {string}
    */
        this.name = data.name;

        /**
         * The hash of the guild icon
         * @type {?string}
         */
        this.icon = data.icon;

        /**
         * The hash of the guild invite splash image
         * @type {?string}
         */
        this.splash = data.splash;

        /**
         * The hash of the guild discovery splash image
         * @type {?string}
         */
        this.discoverySplash = data.discovery_splash;

        /**
         * The region the guild is located in
         * @type {string}
         */
        this.region = data.region;

        /**
         * The full amount of members in this guild
         * @type {number}
         */
        this.memberCount = data.member_count || this.memberCount;

        /**
         * Whether the guild is "large" (has more than large_threshold members, 50 by default)
         * @type {boolean}
         */
        this.large = Boolean('large' in data ? data.large : this.large);

        /**
         * An array of enabled guild features, here are the possible values:
         * * ANIMATED_ICON
         * * BANNER
         * * COMMERCE
         * * COMMUNITY
         * * DISCOVERABLE
         * * FEATURABLE
         * * INVITE_SPLASH
         * * MEMBER_VERIFICATION_GATE_ENABLED
         * * NEWS
         * * PARTNERED
         * * PREVIEW_ENABLED
         * * RELAY_ENABLED
         * * VANITY_URL
         * * VERIFIED
         * * VIP_REGIONS
         * * WELCOME_SCREEN_ENABLED
         * @typedef {string} Features
         */

        /**
         * An array of guild features available to the guild
         * @type {Features[]}
         */
        this.features = data.features;

        /**
         * The ID of the application that created this guild (if applicable)
         * @type {?Snowflake}
         */
        this.applicationID = data.application_id;

        /**
         * The time in seconds before a user is counted as "away from keyboard"
         * @type {?number}
         */
        this.afkTimeout = data.afk_timeout;

        /**
         * The ID of the voice channel where AFK members are moved
         * @type {?Snowflake}
         */
        this.afkChannelID = data.afk_channel_id;

        /**
         * The ID of the system channel
         * @type {?Snowflake}
         */
        this.systemChannelID = data.system_channel_id;

        /**
         * The type of premium tier:
         * * 0: NONE
         * * 1: TIER_1
         * * 2: TIER_2
         * * 3: TIER_3
         * @typedef {number} PremiumTier
         */

        /**
         * The premium tier on this guild
         * @type {PremiumTier}
         */
        this.premiumTier = data.premium_tier;

        if (typeof data.premium_subscription_count !== 'undefined') {
            /**
             * The total number of boosts for this server
             * @type {?number}
             */
            this.premiumSubscriptionCount = data.premium_subscription_count;
        }

        if (typeof data.widget_enabled !== 'undefined') {
            /**
             * Whether widget images are enabled on this guild
             * @type {?boolean}
             */
            this.widgetEnabled = data.widget_enabled;
        }

        if (typeof data.widget_channel_id !== 'undefined') {
            /**
             * The widget channel ID, if enabled
             * @type {?string}
             */
            this.widgetChannelID = data.widget_channel_id;
        }

        /**
         * The verification level of the guild
         * @type {VerificationLevel}
         */
        //this.verificationLevel = VerificationLevels[data.verification_level];

        /**
         * The explicit content filter level of the guild
         * @type {ExplicitContentFilterLevel}
         */
        //this.explicitContentFilter = ExplicitContentFilterLevels[data.explicit_content_filter];

        /**
         * The required MFA level for the guild
         * @type {number}
         */
        this.mfaLevel = data.mfa_level;

        /**
         * The timestamp the client user joined the guild at
         * @type {number}
         */
        this.joinedTimestamp = data.joined_at ? new Date(data.joined_at).getTime() : this.joinedTimestamp;

        /**
         * The value set for the guild's default message notifications
         * @type {DefaultMessageNotifications|number}
         */
        // this.defaultMessageNotifications =
        // DefaultMessageNotifications[data.default_message_notifications] || data.default_message_notifications;

        /**
         * The value set for the guild's system channel flags
         * @type {Readonly<SystemChannelFlags>}
         */
        // this.systemChannelFlags = new SystemChannelFlags(data.system_channel_flags).freeze();

        if (typeof data.max_members !== 'undefined') {
            /**
             * The maximum amount of members the guild can have
             * @type {?number}
             */
            this.maximumMembers = data.max_members;
        } else if (typeof this.maximumMembers === 'undefined') {
            this.maximumMembers = null;
        }

        if (typeof data.max_presences !== 'undefined') {
            /**
             * The maximum amount of presences the guild can have
             * <info>You will need to fetch the guild using {@link Guild#fetch} if you want to receive this parameter</info>
             * @type {?number}
             */
            this.maximumPresences = data.max_presences || 25000;
        } else if (typeof this.maximumPresences === 'undefined') {
            this.maximumPresences = null;
        }

        if (typeof data.approximate_member_count !== 'undefined') {
            /**
             * The approximate amount of members the guild has
             * <info>You will need to fetch the guild using {@link Guild#fetch} if you want to receive this parameter</info>
             * @type {?number}
             */
            this.approximateMemberCount = data.approximate_member_count;
        } else if (typeof this.approximateMemberCount === 'undefined') {
            this.approximateMemberCount = null;
        }

        if (typeof data.approximate_presence_count !== 'undefined') {
            /**
             * The approximate amount of presences the guild has
             * <info>You will need to fetch the guild using {@link Guild#fetch} if you want to receive this parameter</info>
             * @type {?number}
             */
            this.approximatePresenceCount = data.approximate_presence_count;
        } else if (typeof this.approximatePresenceCount === 'undefined') {
            this.approximatePresenceCount = null;
        }

        /**
         * The vanity invite code of the guild, if any
         * @type {?string}
         */
        this.vanityURLCode = data.vanity_url_code;

        /**
         * The use count of the vanity URL code of the guild, if any
         * <info>You will need to fetch this parameter using {@link Guild#fetchVanityData} if you want to receive it</info>
         * @type {?number}
         */
        this.vanityURLUses = null;

        /**
         * The description of the guild, if any
         * @type {?string}
         */
        this.description = data.description;

        /**
         * The hash of the guild banner
         * @type {?string}
         */
        this.banner = data.banner;

        this.id = data.id;
        this.available = !data.unavailable;
        this.features = data.features || this.features || [];

        /**
         * The ID of the rules channel for the guild
         * @type {?Snowflake}
         */
        this.rulesChannelID = data.rules_channel_id;

        /**
         * The ID of the community updates channel for the guild
         * @type {?Snowflake}
         */
        this.publicUpdatesChannelID = data.public_updates_channel_id;

        /**
         * The preferred locale of the guild, defaults to `en-US`
         * @type {string}
         */
        this.preferredLocale = data.preferred_locale;

        /* if (data.channels) {
           this.channels.cache.clear();
           for (const rawChannel of data.channels) {
             this.client.channels.add(rawChannel, this);
           }
         }*/

        /*if (data.roles) {
          this.roles.cache.clear();
          for (const role of data.roles) this.roles.add(role);
        }*/

        /* if (data.members) {
           this.members.cache.clear();
           for (const guildUser of data.members) this.members.add(guildUser);
         }*/

        if (data.owner_id) {
            /**
             * The user ID of this guild's owner
             * @type {Snowflake}
             */
            this.ownerID = data.owner_id;
        }

        /* if (data.presences) {
           for (const presence of data.presences) {
             this.presences.add(Object.assign(presence, { guild: this }));
           }
         }*/

        /* if (data.voice_states) {
           this.voiceStates.cache.clear();
           for (const voiceState of data.voice_states) {
             this.voiceStates.add(voiceState);
           }
         }*/

        /*if (!this.emojis) {
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