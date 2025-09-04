const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const giveawayLogConfig = require('../../components/schema/giveawayLogConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-giveaway-log')
        .setDescription('Set log channels for giveaway events.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of giveaway log')
                .setRequired(true)
                .addChoices(
                    { name: 'create', value: 'giveawayCreate' },
                    { name: 'entry', value: 'giveawayEntry' },
                    { name: 'reroll', value: 'giveawayReroll' },
                    { name: 'end', value: 'giveawayEnd' },
                    { name: 'leave', value: 'giveawayLeave' }
                )
        )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where this type of log will be sent')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    async execute(interaction) {
        const type = interaction.options.getString('type');
        const channel = interaction.options.getChannel('channel');

        let config = await giveawayLogConfig.findOne({ guildId: interaction.guild.id });

        if (!config) {
            config = new giveawayLogConfig({
                guildId: interaction.guild.id,
                channels: {}
            });
        }

        config.channels[type] = channel.id;
        await config.save();

        return interaction.reply({
            content: `✅ Log channel for **${type.replace('giveaway', '')}** set to ${channel}.`,
            flags: 64
        });
    }
};