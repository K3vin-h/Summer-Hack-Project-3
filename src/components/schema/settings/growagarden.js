const mongoose = require('mongoose');

const growAGardenConfig = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true
  },
  stockChannel: {
    type: String,
    default: null
  },
  eggChannel: {
    type: String,
    default: null
  },
  cosmeticChannel: {
    type: String,
    default: null
  },

  stockPing: {
    type: String,
    default: null
  },
  eggPing: {
    type: String,
    default: null
  },
  cosmeticPing: {
    type: String,
    default: null
  },

});

module.exports = mongoose.model('growAGardenConfig', growAGardenConfig);
