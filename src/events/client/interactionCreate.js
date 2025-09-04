module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isCommand()) {
      const { commands, guildCommands } = client;
      const { commandName } = interaction;
      const allCommands = new Map([...commands, ...guildCommands]);
      const command = allCommands.get(commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (error) {
        client.logger.error(error);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          flags: 64
        });
      }
    } else if (interaction.isButton() && interaction.customId === 'giveaway_join') {
      try {
        await client.function.giveaway.manager.handleGiveawayJoin(interaction, client);
      } catch (error) {
        client.logger.error(error);
        await interaction.reply({
          content: 'There was an error joining the giveaway!',
          flags: 64
        });
      }
    } else if (interaction.isButton() && interaction.customId === 'giveaway_leave') {
      try {
        await client.function.giveaway.manager.handleGiveawayLeave(interaction, client);
      } catch (error) {
        client.logger.error(error);
        await interaction.reply({
          content: 'There was an error joining the giveaway!',
          flags: 64
        });
      }
    }
  }
};