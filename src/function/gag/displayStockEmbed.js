const createEmbed = require("./displayEmbed");


async function displayStockEmbed(seed_stock, gear_stock, guildId) {



  const formatStockList = (items) => {
    return items
      .map(({ name, quantity }) => {
        return `${name} - **${quantity}**`;
      })
      .join("\n");
  };

  const seedText = formatStockList(seed_stock) || "No seeds in stock.";
  const gearText = formatStockList(gear_stock) || "No gear in stock.";

  const nowSeconds = Math.floor(Date.now() / 1000);


  const embed = createEmbed({
    title: "Grow a Garden Stock Update",
    description: `**Last Updated:** <t:${nowSeconds}:R>`,
    fields: [
      { name: "**SEEDS STOCK**", value: seedText, inline: true },
      { name: "**GEAR STOCK**", value: gearText, inline: true }
    ],
    color: 0x57f287
  });


  return { embed };
}


async function displayEggStockEmbed(egg_stock, guildId) {


  const eggList = (items) => {
    return items
      .map(({ name, quantity }) => {
        return `${name} - **${quantity}**`;
      })
      .join("\n");
  };


  const nowSeconds = Math.floor(Date.now() / 1000);

  const embed = createEmbed({
    title: "Egg Stock Update",
    description: [
      `**Last Updated:** <t:${nowSeconds}:R>`,
      `\n**EGG STOCK:**\n ${eggList(egg_stock) || "None"}`,
    ].join("\n"),
    color: 0x57f287,
  });


  return { embed };
}

async function displayCosmeticStockEmbed(cosmetic_stock, guildId) {

  const cosmeticList = (items) => {
    return items
      .map(({ name, quantity }) => {
        return `${name} - **${quantity}**`;
      })
      .join("\n");
  };


  const nowSeconds = Math.floor(Date.now() / 1000);
  const embed = createEmbed({
    title: "Cosmetic Stock Update",
    description: `**Last Updated:** <t:${nowSeconds}:R>\n\n**COSMETIC STOCK:**\n${cosmeticList(cosmetic_stock) || "None"}`,

    color: 0x57f287,
  });

  return { embed };
}

module.exports = {
  displayStockEmbed,
  displayEggStockEmbed,
  displayCosmeticStockEmbed,

};
