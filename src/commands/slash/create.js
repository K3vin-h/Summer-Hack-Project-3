const { SlashCommandBuilder } = require('discord.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Start a new giveaway')
    
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize for the giveaway')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the giveaway (e.g., 1d, 2h, 30m)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the giveaway to')
        .addChannelTypes(0)
        .setRequired(true))
    .addUserOption(option =>
      option.setName('hosted')
        .setDescription('Hosted by')
        .setRequired(false))
    .addRoleOption(option =>
          option.setName('required_role')
            .setDescription('Role required to enter')
            .setRequired(false))
    .addStringOption(option =>
      option.setName('required_server')
        .setDescription('Server ID required to join')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('bonus_entries')
        .setDescription('Bonus entries in format "roleId:entries,roleId2:entries2"')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('bypass_roles')
        .setDescription('Roles that bypass requirements (comma separated role IDs)')
        .setRequired(false)),
  async execute(interaction, client) {
    await client.function.giveaway.manager.createGiveaway(interaction, client);
  }
};