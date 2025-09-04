const { PresenceUpdateStatus, ActivityType } = require('discord.js');
const Giveaway = require("../../components/schema/giveaway")
const setActivity = async (client) => {
  try {
    client.user.setPresence({ activities: [{ name: 'Giveaways', type: ActivityType.Watching }], status: PresenceUpdateStatus.Idle });
  } catch { }
};
const cron = require("node-cron");
const { sendStockOnly, sendEggOnly, sendCosmeticOnly} = require("../../function/gag/sendData");


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const flags = {
  stockRunning: false,
  eggRunning: false,
  cosmeticRunning: false,
  eventRunning: false,
  lastSeenRunning: false,
};
module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    client.logger.info(`[STATUS MANAGER] ${client.user.username} is online.`);

    setInterval(() => {
      setActivity(client).catch((e) => e);
    }, 10000);



    setInterval(async () => {
      const now = new Date();
      const giveaways = await Giveaway.find({ ended: false, endTime: { $lte: now } });
      for (const giveaway of giveaways) {
        await client.function.giveaway.manager.endGiveaway(null, giveaway, client);

      }
    }, 60000);

    cron.schedule("*/5 * * * *", async () => {
      if (flags.stockRunning) return;
      flags.stockRunning = true;
      try {
        client.logger.info(`[GROWAGARDEN] Scheduled stock update in 5 seconds...`);
        await delay(5 * 1000);
        await sendStockOnly(client);
        client.logger.info(`[GROWAGARDEN] Stock update sent.`);
      } catch (err) {
        client.logger.error(`[CRON ERROR][STOCK] ${err.message}`);
      }
      flags.stockRunning = false;
    });

  
    cron.schedule("*/30 * * * *", async () => {
      if (flags.eggRunning) return;
      flags.eggRunning = true;
      try {
        client.logger.info(`[GROWAGARDEN] Scheduled egg update in 5 seconds...`);
        await delay(5 * 1000);
        await sendEggOnly(client);
        client.logger.info(`[GROWAGARDEN] Egg update sent.`);
      } catch (err) {
        client.logger.error(`[CRON ERROR][EGG] ${err.message}`);
      }
      flags.eggRunning = false;
    });

    // Cosmetic update every 4 hours with 5 seconds delay
    cron.schedule("0 */4 * * *", async () => {
      if (flags.cosmeticRunning) return;
      flags.cosmeticRunning = true;
      try {
        client.logger.info(`[GROWAGARDEN] Scheduled cosmetic update in 5 seconds...`);
        await delay(5 * 1000);
        await sendCosmeticOnly(client);
        client.logger.info(`[GROWAGARDEN] Cosmetic update sent.`);
      } catch (err) {
        client.logger.error(`[CRON ERROR][COSMETIC] ${err.message}`);
      }
      flags.cosmeticRunning = false;
    });

  },
};