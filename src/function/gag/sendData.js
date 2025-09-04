const fetchStock = require("../../function/gag/fetchStock");
const {
    displayStockEmbed,
    displayEggStockEmbed,
    displayCosmeticStockEmbed,
    displayEventStockEmbed
} = require("../../function/gag/displayStockEmbed");
const growAGardenConfig = require("../../components/schema/settings/growagarden");
async function sendStockOnly(client) {
    const seedData = await fetchStock("https://gagapi.onrender.com/seeds");
    const gearData = await fetchStock("https://gagapi.onrender.com/gear");

    const allConfigs = await growAGardenConfig.find();
    const shardGuildIds = client.guilds.cache.map(guild => guild.id);
    const configs = allConfigs.filter(config => shardGuildIds.includes(config.guildId));

    for (const config of configs) {
        const { guildId, stockChannel, stockPing } = config;
        if (!stockChannel) continue;

        try {

            const stockChannelObj = await client.channels.fetch(stockChannel).catch(() => null);
            if (!stockChannelObj?.isTextBased()) continue;

            const { embed } = await displayStockEmbed(seedData, gearData, guildId);

            const content = stockPing ? `<@&${stockPing}>` : null

            await stockChannelObj.send({
                content: content || null,
                embeds: [embed],
                allowedMentions: { parse: ['roles'], repliedUser: false }
            });
        } catch (err) {
            client.logger.warn(`[GROWAGARDEN][STOCK] Guild ${guildId}: ${err.message}`);
        }
    }
}

async function sendEggOnly(client) {
    const stockData = await fetchStock("https://gagapi.onrender.com/eggs");
    const allConfigs = await growAGardenConfig.find();
    const shardGuildIds = client.guilds.cache.map(guild => guild.id);
    const configs = allConfigs.filter(config => shardGuildIds.includes(config.guildId));

    for (const config of configs) {
        const { guildId, eggChannel, eggPing } = config;
        if (!eggChannel) continue;

        try {
            const eggChannelObj = await client.channels.fetch(eggChannel).catch(() => null);
            if (!eggChannelObj?.isTextBased()) continue;

            const { embed } = await displayEggStockEmbed(stockData, guildId);
            const content = eggPing ? `<@&${eggPing}>` : null

            await eggChannelObj.send({
                content: content || null,
                embeds: [embed],
                allowedMentions: { parse: ['roles'], repliedUser: false }
            });
        } catch (err) {
            client.logger.warn(`[GROWAGARDEN][EGG] Guild ${guildId}: ${err.message}`);
        }
    }
}
async function sendCosmeticOnly(client) {
    const stockData = await fetchStock("https://gagapi.onrender.com/cosmetics");
    const allConfigs = await growAGardenConfig.find();
    const shardGuildIds = client.guilds.cache.map(guild => guild.id);
    const configs = allConfigs.filter(config => shardGuildIds.includes(config.guildId));


    for (const config of configs) {
        const { guildId, cosmeticChannel, cosmeticPing } = config;
        if (!cosmeticChannel) continue;

        try {
            const cosmeticChannelObj = await client.channels.fetch(cosmeticChannel).catch(() => null);
            if (!cosmeticChannelObj?.isTextBased()) continue;
            const { embed } = await displayCosmeticStockEmbed(stockData, guildId);
            const content = cosmeticPing ? `<@&${cosmeticPing}>` : null

            await cosmeticChannelObj.send({
                content: content || null,
                embeds: [embed],
                allowedMentions: { parse: ['roles'], repliedUser: false }
            });
        } catch (err) {
            client.logger.warn(`[GROWAGARDEN][COSMETIC] Guild ${guildId}: ${err.message}`);
        }
    }
}

module.exports = {
    sendStockOnly,
    sendEggOnly,
    sendCosmeticOnly,
};