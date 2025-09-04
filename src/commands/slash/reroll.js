const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');
const Giveaway = require('../../components/schema/giveaway');
const Log = require('../../components/schema/giveawayLogConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reroll')
        .setDescription('Reroll a giveaway')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The message ID of the giveaway to reroll')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('New number of winners (optional)')
                .setRequired(false)),

    async execute(interaction, client) {

        const messageId = interaction.options.getString('message_id');
        const newWinners = interaction.options.getInteger('winners');

        try {
            const giveaway = await Giveaway.findOne({ messageId });

            if (!giveaway) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Giveaway Not Found')
                        .setDescription(`No giveaway was found with the message ID: \`${messageId}\``)
                        .setTimestamp()],
                    flags: 64
                });
            }

            if (!giveaway.ended) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('Giveaway Still Active')
                        .setDescription('This giveaway has not ended yet.')
                        .setTimestamp()],
                    flags: 64
                });
            }

            const channel = await interaction.guild.channels.fetch(giveaway.channelId).catch(() => null);
            if (!channel) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Channel Not Found')
                        .setDescription('The giveaway channel no longer exists.')
                        .setTimestamp()],
                    flags: 64
                });
            }

            const message = await channel.messages.fetch(messageId).catch(() => null);
            if (!message) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Message Not Found')
                        .setDescription('Could not find the giveaway message.')
                        .setTimestamp()],
                    flags: 64
                });
            }

            const validEntries = [];
            const participants = new Set();

            for (const entry of giveaway.entries) {
                try {
                    const member = await interaction.guild.members.fetch(entry.userId);
                    const isValid = await client.function.giveaway.validator.checkRequirements(giveaway, member);
                    if (isValid) {
                        participants.add(entry.userId);
                        validEntries.push(...Array(entry.entries).fill(entry.userId));
                    }
                } catch {
                    client.logger.debug(`User ${entry.userId} not found during reroll`);
                }
            }

            const winnerCount = newWinners || giveaway.winners;
            const uniqueEntries = [...new Set(validEntries)];
            const winners = [];

            for (let i = 0; i < winnerCount && uniqueEntries.length > 0; i++) {
                const index = Math.floor(Math.random() * uniqueEntries.length);
                winners.push(uniqueEntries[index]);
                uniqueEntries.splice(index, 1);
            }

            const rerollEmbed = EmbedBuilder.from(message.embeds[0])
                .setDescription(
                    `**Rerolled Winner(s):** ${winners.map(id => `<@${id}>`).join(', ') || 'No valid participants'}\n` + `**Total Participants:** ${participants.size}\n` +
                    `**Hosted by:** <@${giveaway.hosted}>\n` + "\n" +
                    `Giveaway rerolled by <@${interaction.user.id}> at <t:${Math.floor(Date.now() / 1000)}:f>`
                );

            await message.edit({ embeds: [rerollEmbed] });

            if (winners.length > 0) {
                const rerollEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle(`Giveaway Rerolled: ${giveaway.prize}`)
                    .setDescription(
                        `**Prize:** ${giveaway.prize}\n` +
                        `**New Winner(s):** ${winners.map(id => `<@${id}>`).join(', ')}\n` +
                        `**Total Participants:** ${participants.size}\n` +
                        `**Giveaway Link:** [Jump to Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`
                    )
                    .setTimestamp();

                await channel.send({
                    content: `Giveaway rerolled! New Winners: ${winners.map(id => `<@${id}>`).join(', ')}!`,
                    embeds: [rerollEmbed]
                });
            } else {
                const noWinnerEmbed = new EmbedBuilder()
                    .setColor('#808080')
                    .setTitle('Giveaway Rerolled: No Winners')
                    .setDescription(
                        `**Result:** No valid participants found for reroll.\n` +
                        `**Giveaway Link:** [Jump to Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`
                    )
                    .setTimestamp();

                await channel.send({
                    embeds: [noWinnerEmbed]
                });
            }

            // Send to logs
            const log = await Log.findOne({ guildId: interaction.guild.id });
            if (log?.channels?.giveawayReroll) {
                const logChannel = interaction.guild.channels.cache.get(log.channels.giveawayReroll);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('Giveaway Rerolled')
                        .setDescription(`[Jump to Giveaway](https://discord.com/channels/${interaction.guild.id}/${channel.id}/${messageId})`)
                        .addFields(
                            { name: 'Prize', value: giveaway.prize, inline: true },
                            { name: 'New Winner(s)', value: winners.length > 0 ? winners.map(id => `<@${id}>`).join(', ') : 'None', inline: false },
                            { name: 'Participants', value: participants.size.toString(), inline: true },
                            { name: 'Rerolled by', value: `<@${interaction.user.id}>`, inline: true }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#00CC66')
                    .setTitle('Giveaway Rerolled')
                    .setDescription(`Successfully rerolled the giveaway for **${giveaway.prize}**.`)
                    .addFields({ name: 'New Winners', value: winners.length.toString(), inline: true })
                    .setTimestamp()],
                flags: 64
            });

        } catch (error) {
            client.logger.error('Reroll command error:', error);
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Unexpected Error')
                    .setDescription('An error occurred while rerolling the giveaway.')
                    .setTimestamp()],
                flags: 64
            });
        }
    }
};