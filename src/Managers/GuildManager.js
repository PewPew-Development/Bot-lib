class GuildManager {
    constructor(client, iterable) {
      super(client, iterable, Guild);
    }
    resolve(guild) {
        if (
          guild instanceof GuildChannel ||
          guild instanceof GuildMember ||
          guild instanceof GuildEmoji ||
          guild instanceof Role ||
          (guild instanceof Invite && guild.guild)
        ) {
          return super.resolve(guild.guild);
        }
        return super.resolve(guild);
      }

      
}