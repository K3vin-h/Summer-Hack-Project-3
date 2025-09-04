const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  messageId: String,
  channelId: String,
  guildId: String,
  guildName: String,        // NEW
  hosted: String,
  hostedTag: String,        // NEW
  prize: String,
  winners: Number,
  createdAt: Date,
  requiredRoleId: String,
  requiredJoinServerId: String,
  bonusEntries: [{
    roleId: String,
    entries: Number
  }],
  bypassRoles: [String],
  entries: [{
    userId: String,
    entries: Number
  }],
  ended: { type: Boolean, default: false },
  endTime: { type: Date, index: true },
  created: String,
  creatorTag: String        // NEW
}, { timestamps: true });

giveawaySchema.virtual('shouldCleanup').get(function () {
  return this.ended && (new Date() - this.endTime) > (30 * 24 * 60 * 60 * 1000);
});

module.exports = mongoose.model('Giveaway', giveawaySchema);