const giveawayLogConfig = require("../../components/schema/giveawayLogConfig")
module.exports = {
    async hasGiveawayRole(interaction) {
        const config = await giveawayLogConfig.findOne({ guildId: interaction.guild.id });
        if (!config || !config.giveawayrole) return false;
        return interaction.member.roles.cache.has(config.giveawayrole);
    }
}