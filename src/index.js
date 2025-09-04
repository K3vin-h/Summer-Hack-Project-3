require("dotenv").config();
const { token, mongo } = process.env;
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
const path = require("path")

const mongoose = require('mongoose');
const express = require('express');

const app = express();
const port =  3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent 
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember 
  ],
});

client.commands = new Collection();
client.commandArray = [];

client.guildCommands = new Map();
client.guildCommandArray = [];

client.logger = require("./logger/logger.js");
client.function = {}; 
client.function.giveaway = {
  manager: require('./function/giveaway/manager.js'),
  giveawayRole: require('./function/giveaway/giveawayRole.js'),
  validator: require('./function/giveaway/validator.js'),
};


const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
process.on('unhandledRejection', (reason, promise) => {
  client.logger.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', error => {
  client.logger.error('[UNCAUGHT EXCEPTION]', error);
});

process.on('uncaughtExceptionMonitor', error => {
  client.logger.error('[UNCAUGHT EXCEPTION MONITOR]', error);
});

// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => client.logger.info('Connected to MongoDB'))
//   .catch(err => client.logger.error('MongoDB connection error:', err));

client.login(token);


client.once('ready', () => {
  isReady = true;
  client.logger.info(`Website running with: ${client.user.tag}!`);
});

app.get('/', (req, res) => {
  res.send('Discord Bot is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});