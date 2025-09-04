const Giveaway = require('../../components/schema/giveaway');
const { scheduleJob } = require('node-schedule');

module.exports = async (client) => {

    scheduleJob('0 0 * * *', async () => {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const result = await Giveaway.deleteMany({
                ended: true,
                endTime: { $lte: thirtyDaysAgo }
            });

            client.logger.info(`[Giveaway Cleanup] Deleted ${result.deletedCount} old giveaways`);
        } catch (error) {
            client.logger.error('Giveaway cleanup error:', error);
        }
    });
};