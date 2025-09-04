const { EmbedBuilder } = require("discord.js");
const stockroleSchema = require("../../schemas/values/StockRoleSchema");

async function configSeed(interaction) {
  const seed = interaction.options.getString("seed");
  const role = interaction.options.getRole("role");

  const existingSchema = await stockroleSchema.findOne({
    display_name: seed,
    guildId: interaction.guild.id,
    type: "seed",
  });

  if (existingSchema) {
    existingSchema.role_id = role.id;
    await existingSchema.save();
  } else {
    const newSchema = new stockroleSchema({
      guildId: interaction.guild.id,
      display_name: seed,
      role_id: role.id,
      type: "seed",
    });
    await newSchema.save();
  }

  const successEmbed = new EmbedBuilder()
    .setDescription("Successfully updated")
    .addFields(
      { name: "Seed", value: seed, inline: true },
      { name: "Role", value: `<@&${role.id}>`, inline: true }
    )
    .setColor("Blurple")

  await interaction.reply({ embeds: [successEmbed], ephemeral: true });
}
async function configGear(interaction) {
  const gear = interaction.options.getString("gear");
  const role = interaction.options.getRole("role");
  const existingSchema = await stockroleSchema.findOne({
    display_name: gear,
    guildId: interaction.guild.id,
    type: "gear",
  });

  if (existingSchema) {
    existingSchema.role_id = role.id;
    await existingSchema.save();
  } else {
    const newSchema = new stockroleSchema({
      guildId: interaction.guild.id,
      display_name: gear,
      role_id: role.id,
      type: "gear",
    });
    await newSchema.save();
  }
  const successEmbed = new EmbedBuilder()
    .setDescription("Successfully updated")
    .addFields(
      { name: "Gear", value: gear, inline: true },
      { name: "Role", value: `<@&${role.id}>`, inline: true }
    )
    .setColor("Blurple")

  await interaction.reply({ embeds: [successEmbed], ephemeral: true });
}
async function configEgg(interaction) {
  const egg = interaction.options.getString("egg");
  const role = interaction.options.getRole("role");

  let message = "Successfully updated";
  const existingSchema = await stockroleSchema.findOne({
    display_name: egg,
    guildId: interaction.guild.id,
    type: "egg",
  });

  if (existingSchema) {
    existingSchema.role_id = role.id;
    await existingSchema.save();
  } else {
    const newSchema = new stockroleSchema({
      guildId: interaction.guild.id,
      display_name: egg,
      role_id: role.id,
      type: "egg",
    });
    await newSchema.save();
    message = "Successfully added";
  }

  const successEmbed = new EmbedBuilder()
    .setDescription(message)
    .addFields(
      { name: "Egg", value: egg, inline: true },
      { name: "Role", value: `<@&${role.id}>`, inline: true }
    )
    .setColor("Blurple");

  await interaction.reply({ embeds: [successEmbed], ephemeral: true });
}
async function configCosmetic(interaction) {
  const cosmetic = interaction.options.getString("cosmetic");
  const role = interaction.options.getRole("role");
  const existingSchema = await stockroleSchema.findOne({
    display_name: cosmetic,
    guildId: interaction.guild.id,
    type: "cosmetic",
  });
  if (existingSchema) {
    existingSchema.role_id = role.id;
    await existingSchema.save();
  } else {
    const newSchema = new stockroleSchema({
      guildId: interaction.guild.id,
      display_name: cosmetic,
      role_id: role.id,
      type: "cosmetic",
    });
    await newSchema.save();
    const successEmbed = new EmbedBuilder()
      .setDescription("Successfully added")
      .addFields(
        { name: "Cosmetic", value: cosmetic, inline: true },
        { name: "Role", value: `<@&${role.id}>`, inline: true }
      )
      .setColor("Blurple");

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  }
}
async function viewRoles(interaction) {
  const schema = await stockroleSchema.find({
    guildId: interaction.guild.id,
  });
  const seed = schema
    .filter((item) => item.type === "seed")
    .map((item) => `${item.display_name}: <@&${item.role_id}>`)
    .join("\n");

  const gear = schema
    .filter((item) => item.type === "gear")
    .map((item) => `${item.display_name}: <@&${item.role_id}>`)
    .join("\n");

  const egg = schema
    .filter((item) => item.type === "egg")
    .map((item) => `${item.display_name}: <@&${item.role_id}>`)
    .join("\n");

  const cosmetic = schema
    .filter((item) => item.type === "cosmetic")
    .map((item) => `${item.display_name}: <@&${item.role_id}>`)
    .join("\n");

  const weatherNames = [
    "Rain",
    "Heatwave",
    "SummerHarvest",
    "Tornado",
    "Windy",
    "AuroraBorealis",
    "TropicalRain",
    "NightEvent",
    "SunGod",
    "MegaHarvest",
    "Gale",
    "Thunderstorm",
    "BloodMoonEvent",
    "MeteorShower",
    "SpaceTravel",
    "Disco",
    "DJJhai",
    "Blackhole",
    "JandelStorm",
    "Sandstorm",
    "DJSandstorm",
    "Volcano",
    "UnderTheSea",
    "AlienInvasion",
    "JandelLazer",
    "Obby",
    "PoolParty",
    "JandelZombie"
  ];


  function toTitleCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/^./, (s) => s.toUpperCase());
  }


  const weather = schema
    .filter((item) => item.type === "weather")
    .map((item) => {
      const matchedName = weatherNames.find(
        (w) => w.toLowerCase() === item.display_name.toLowerCase()
      );

      const readableName = matchedName ? toTitleCase(matchedName) : item.display_name;
      return `${readableName}: <@&${item.role_id}>`;
    })
    .join("\n");
  const event = schema.filter((item) => item.type === "event")
    .map((item) => `${item.display_name}: <@&${item.role_id}>`)
    .join("\n");;
  const Embed = new EmbedBuilder()
    .setTitle("Ping Role Configs")
    .addFields(
      { name: "Seed Pings", value: seed ? seed : "No seed pings set.", inline: true },
      { name: "Gear Prings", value: gear ? gear : "No gear pings set.", inline: true },
      { name: "Egg Pings", value: egg ? egg : "No egg pings set.", inline: true },
      { name: "Cosmetics Pings", value: cosmetic ? cosmetic : "No cosmetics pings set.", inline: true },
      { name: "Weather Pings", value: weather ? weather : "No weather pings set.", inline: true },
      { name: "Event Pings", value: event ? event : "No event pings set.", inline: true }
    )
    .setColor("Blurple")

  await interaction.reply({
    embeds: [Embed],
    ephemeral: true,
  });
}

async function resetConfig(interaction) {
  const type = interaction.options.getString("type");
  const guildId = interaction.guild.id;

  const validTypes = new Set(["seed", "gear", "egg", "cosmetics", "weather", "event"]);

  if (type === "all") {
    await stockroleSchema.deleteMany({ guildId });
  } else if (validTypes.has(type)) {
    await stockroleSchema.deleteMany({ guildId, type });
  }

  const successEmbed = new EmbedBuilder()
    .setDescription("Successfully reset config")
    .setColor("Blurple");

  await interaction.reply({
    embeds: [successEmbed],
    ephemeral: true,
  });
}
async function configWeather(interaction) {
  const weather = interaction.options.getString("weather");
  const role = interaction.options.getRole("role");

  const existingSchema = await stockroleSchema.findOne({
    display_name: weather.toLowerCase(),
    guildId: interaction.guild.id,
    type: "weather",
  });

  if (existingSchema) {
    existingSchema.role_id = role.id;
    await existingSchema.save();
  } else {
    const newSchema = new stockroleSchema({
      guildId: interaction.guild.id,
      display_name: weather.toLowerCase(),
      role_id: role.id,
      type: "weather",
    });
    await newSchema.save();
    const successEmbed = new EmbedBuilder()
      .setDescription("Successfully added")
      .addFields(
        { name: "Weather", value: weather, inline: true },
        { name: "Role", value: `<@&${role.id}>`, inline: true }
      )
      .setColor("Blurple");

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  }
}
async function configEvent(interaction) {
  const event = interaction.options.getString("event");
  const role = interaction.options.getRole("role");

  const existingSchema = await stockroleSchema.findOne({
    display_name: event,
    guildId: interaction.guild.id,
    type: "event",
  });
  if (existingSchema) {
    existingSchema.role_id = role.id;
    await existingSchema.save();
  } else {
    const newSchema = new stockroleSchema({
      guildId: interaction.guild.id,
      display_name: event,
      role_id: role.id,
      type: "event",
    });
    await newSchema.save();
    const successEmbed = new EmbedBuilder()
      .setDescription("Successfully added")
      .addFields(
        { name: "Event", value: event, inline: true },
        { name: "Role", value: `<@&${role.id}>`, inline: true }
      )
      .setColor("Blurple");

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  }
}
module.exports = {
  configSeed,
  viewRoles,
  resetConfig,
  configGear,
  configEgg,
  configCosmetic,
  configWeather,
  configEvent
};
