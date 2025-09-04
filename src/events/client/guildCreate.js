const giveawayLogConfig = require('../../components/schema/giveawayLogConfig');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    try {
      const exists = await giveawayLogConfig.findOne({ guildId: guild.id });
      if (!exists) {
        await giveawayLogConfig.create({
          guildId: guild.id,
          channels: {}
        });
        client.logger.info(`Created log config for new guild: ${guild.name} (${guild.id})`);
      }
      client.logger.info(`[GUILD JOIN] ${guild.name} (${guild.id}) | Members: ${guild.memberCount}`);
    } catch (err) {
      client.logger.error(`Error creating log config for guild ${guild.id}:`, err);
    }
  }
};