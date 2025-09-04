const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const giveawayLogConfig = require('../../components/schema/giveawayLogConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-settings')
        .setDescription('View the current giveaway log channel and giveaway role settings.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction, client) {
        try {
            const config = await giveawayLogConfig.findOne({ guildId: interaction.guild.id });

            if (!config || !config.channels) {
                return interaction.reply({
                    content: 'No giveaway log settings are set for this server.',
                    flags: 64
                });
            }

            const { channels, giveawayrole } = config;

            const embed = new EmbedBuilder()
                .setTitle('🎉 Giveaway Settings')
                .setColor('#00FF00')
                .setTimestamp();

            const formatChannel = (id) => id ? `<#${id}>` : 'Not Set';
            const formatRole = (id) => id ? `<@&${id}>` : 'Not Set';

            embed.addFields(
                { name: '📥 Create Logs', value: formatChannel(channels.giveawayCreate), inline: true },
                { name: '🎟️ Entry Logs', value: formatChannel(channels.giveawayEntry), inline: true },
                { name: '🔁 Reroll Logs', value: formatChannel(channels.giveawayReroll), inline: true },
                { name: '⏹️ End Logs', value: formatChannel(channels.giveawayEnd), inline: true },
                { name: '🏆 LeaveLogs', value: formatChannel(channels.giveawayLeave), inline: true },

            );

            return interaction.reply({ embeds: [embed], flags: 64 });

        } catch (error) {
            client.logger.error('Error viewing giveaway settings:', error);
            return interaction.reply({
                content: '❌ Failed to fetch giveaway settings.',
                flags: 64
            });
        }
    }
};