
const growAGardenConfig = require("../../components/schema/settings/growagarden");
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gagsettings")
    .setDescription("Manage Grow-a-Garden settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName("config")
        .setDescription("Update stock, egg, cosmetic, or weather settings")
        .addChannelOption(opt => opt.setName("stock_channel").setDescription("Channel for stock updates").addChannelTypes(ChannelType.GuildText))
        .addChannelOption(opt => opt.setName("egg_channel").setDescription("Channel for egg updates").addChannelTypes(ChannelType.GuildText))
        .addChannelOption(opt => opt.setName("cosmetic_channel").setDescription("Channel for cosmetic updates").addChannelTypes(ChannelType.GuildText))
        .addRoleOption(opt => opt.setName("stock_ping").setDescription("Role to ping for stock"))
        .addRoleOption(opt => opt.setName("egg_ping").setDescription("Role to ping for eggs"))
        .addRoleOption(opt => opt.setName("cosmetic_ping").setDescription("Role to ping for cosmetics"))

    )

    .addSubcommand(sub =>
      sub.setName("view").setDescription("View the current Grow-a-Garden configuration")
    )

    .addSubcommand(sub =>
      sub.setName("reset").setDescription("Clear the Grow-a-Garden configuration for this server")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === "config") {
      const updates = {};

      const stockChannel = interaction.options.getChannel("stock_channel");
      const eggChannel = interaction.options.getChannel("egg_channel");
      const cosmeticChannel = interaction.options.getChannel("cosmetic_channel");


      const stockPing = interaction.options.getRole("stock_ping");
      const eggPing = interaction.options.getRole("egg_ping");
      const cosmeticPing = interaction.options.getRole("cosmetic_ping");


      if (stockChannel) updates.stockChannel = stockChannel.id;
      if (eggChannel) updates.eggChannel = eggChannel.id;
      if (cosmeticChannel) updates.cosmeticChannel = cosmeticChannel.id;

      if (stockPing) updates.stockPing = stockPing.id;
      if (eggPing) updates.eggPing = eggPing.id;
      if (cosmeticPing) updates.cosmeticPing = cosmeticPing.id;


      if (Object.keys(updates).length === 0) {
        const embed = new EmbedBuilder()
          .setDescription("Please provide at least one field to update.")
          .setColor("Yellow")
        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }

      const existingConfig = await growAGardenConfig.findOne({ guildId });

      if (existingConfig) {
        await growAGardenConfig.updateOne({ guildId }, { $set: updates });
        const successEmbed = new EmbedBuilder()
          .setDescription("Configuration Updated")
          .setColor("Green")
        for (const [key, value] of Object.entries(updates)) {
          successEmbed.addFields({
            name: key,
            value: value,
          });
        }
        return interaction.reply({
          embeds: [successEmbed],
          ephemeral: true,
        });
      } else {
        await growAGardenConfig.create({
          guildId,
          ...updates,
        });

        const successEmbed = new EmbedBuilder()
          .setDescription("Configuration Created")
          .setColor("Green")
        for (const [key, value] of Object.entries(updates)) {
          successEmbed.addFields({
            name: key,
            value: value,
          });
        }
        return interaction.reply({
          embeds: [successEmbed],
          ephemeral: true,
        });
      }
    } else if (sub === "view") {
      const config = await growAGardenConfig.findOne({ guildId });
      if (!config) {
        const noEmbed = new EmbedBuilder()
          .setDescription("No Grow a Garden configuration found for this server")
          .setColor("Yellow")
        return interaction.reply({
          embeds: [noEmbed],
          ephemeral: true,
        });
      }
      const configEmbed = new EmbedBuilder()
        .setTitle("Grow a Garden Configuration")
        .setColor("Blurple")
        .addFields(
          {
            name: "Stock Channel",
            value: config.stockChannel
              ? `<#${config.stockChannel}>\nPing Role: ${config.stockPing ? `<@&${config.stockPing}>` : "_Not set_"}`
              : "_Not set_",

            inline: true,
          },
          {
            name: "Egg Channel",
            value: config.eggChannel ? `<#${config.eggChannel}>\nPing Role: ${config.eggPing ? `<@&${config.eggPing}>` : "_Not set_"}` : "_Not set_",
            inline: true,
          },
          {
            name: "Cosmetic Channel",
            value: config.cosmeticChannel ? `<#${config.cosmeticChannel}>\nPing Role: ${config.cosmeticPing ? `<@&${config.cosmeticPing}>` : "_Not set_"}` : "_Not set_",
            inline: true,
          },
        )

      await interaction.reply({
        embeds: [configEmbed],
        ephemeral: true,
      });
    }

    else if (sub === "reset") {
      const config = await growAGardenConfig.findOne({ guildId });
      if (!config) {
        const noEmbed = new EmbedBuilder()
          .setDescription("No Grow a Garden configuration found for this server")
          .setColor("Yellow")
        return interaction.reply({
          embeds: [noEmbed],
          ephemeral: true,
        });
      }

      await growAGardenConfig.deleteOne({ guildId });
      const successEmbed = new EmbedBuilder()
        .setDescription("Grow a Garden configuration has been cleared for this server")
        .setColor("Green")
      await interaction.reply({
        embeds: [successEmbed],
        ephemeral: true,
      });
    }
  },
};
