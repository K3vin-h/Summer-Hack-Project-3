const giveawayLogConfig = require('../../components/schema/giveawayLogConfig');

module.exports = {
    name: 'guildDelete',
    async execute(guild, client) {
        try {
            const result = await giveawayLogConfig.findOneAndDelete({ guildId: guild.id });
            if (result) {
                client.logger.info(`[GUILD LEAVE] Removed log config for guild: ${guild.name || 'Unknown'} (${guild.id})`);
            } else {
                client.logger.info(`[GUILD LEAVE] No log config found for guild: ${guild.name || 'Unknown'} (${guild.id})`);
            }

            client.logger.info(`[GUILD LEAVE] ${guild.name || 'Unknown'} (${guild.id})`);
        } catch (err) {
            client.logger.error(`Error deleting log config for guild ${guild.id}:`, err);
        }
    }
};