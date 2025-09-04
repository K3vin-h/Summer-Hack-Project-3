const mongoose = require("mongoose");
const Giveaway = require("../../components/schema/giveaway");

module.exports = async (client) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    client.logger.info('Connected to MongoDB');

    mongoose.connection.on('connected', () => client.logger.info('Mongoose connected'));
    mongoose.connection.on('error', (err) => client.logger.error('Mongoose connection error:', err));
    mongoose.connection.on('disconnected', () => client.logger.warn('Mongoose disconnected'));

    try {
      await Giveaway.collection.createIndex(
        { endTime: 1 },
        { expireAfterSeconds: 2592000 } // 30 days
      );
      client.logger.info('Created TTL index for giveaways');
    } catch (indexError) {
      if (indexError.code === 85) {
        client.logger.warn('TTL index already exists');
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    client.logger.error('MongoDB connection error:', error);
  }
};