const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Giveaway = require('../../components/schema/giveaway');
const Log = require("../../components/schema/giveawayLogConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Deletes a giveaway by message ID.')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('The message ID of the giveaway to delete')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const messageId = interaction.options.getString('message_id');


    const giveaway = await Giveaway.findOne({ messageId });

    if (!giveaway) {
      const notFoundEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Giveaway Not Found')
        .setDescription('No giveaway was found with that message ID.')
        .setTimestamp();
      return interaction.reply({ embeds: [notFoundEmbed], flags: 64 });
    }

    try {
      const channel = await interaction.guild.channels.fetch(giveaway.channelId).catch(() => null);
      const message = channel ? await channel.messages.fetch(giveaway.messageId).catch(() => null) : null;

      if (message) await message.delete();
      await Giveaway.deleteOne({ messageId });

      const successEmbed = new EmbedBuilder()
        .setColor('#00CC66')
        .setTitle('Giveaway Deleted')
        .setDescription(`The giveaway for **${giveaway.prize}** has been successfully deleted.`)
        .setTimestamp();

      // Send log if configured
      const log = await Log.findOne({ guildId: interaction.guild.id });
      if (log?.channels?.giveawayDelete) {
        const logChannel = await interaction.guild.channels.fetch(log.channels.giveawayDelete).catch(() => null);
        if (logChannel) {
          const jumpLink = message
            ? `https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`
            : 'Original message was deleted.';

          const logEmbed = new EmbedBuilder()
            .setColor('#CC0000')
            .setTitle('Giveaway Deleted')
            .setDescription(typeof jumpLink === 'string' ? `[Jump to Giveaway](${jumpLink})` : 'Message not available.')
            .addFields(
              { name: 'Prize', value: giveaway.prize, inline: false },
              { name: 'Deleted By', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Original Channel', value: channel ? `<#${channel.id}>` : 'Channel deleted', inline: true },
              { name: 'Status', value: giveaway.ended ? 'Ended' : 'Ongoing', inline: true }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      return interaction.reply({ embeds: [successEmbed], flags: 64 });
    } catch (err) {
      console.error('Delete giveaway error:', err);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Deletion Failed')
        .setDescription('An error occurred while deleting the giveaway or its message.')
        .setTimestamp();

      return interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
  }
};
