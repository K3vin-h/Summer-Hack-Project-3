const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");

require("dotenv").config();
const { token } = process.env;

const retriveUserIdbyToken = (token) => {
  const parseuser = token.split(".")[0];
  const buff = Buffer.from(parseuser, "base64");
  const userid = buff.toString("utf-8");
  return userid;
};

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray, guildCommandArray, guildCommands } =
        client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        if (!command.guilds) {
          commands.set(command.data.name, command);
          commandArray.push(command.data.toJSON());
          client.logger.info(

            `[COMMAND MANAGER] ${command.data.name} has been launched.`

          );
        } else {
          guildCommands.set(command.data.name, command);
          guildCommandArray.push({
            data: command.data.toJSON(),
            guilds: command.guilds,
          });
          client.logger.info(

            `[GUILD COMMAND MANAGER] ${command.data.name} has been launched.`

          );
        }
      }
    }

    const clientID = retriveUserIdbyToken(token);
    const rest = new REST({ version: "10" }).setToken(process.env.token);
    try {
      client.logger.info(
        "[COMMAND MANAGER] Refreshing slash commands."
      );

      await rest.put(Routes.applicationCommands(clientID), {
        body: client.commandArray,
      });

      const guildCommandsByGuild = {};

      for (const guildCommand of client.guildCommandArray) {
        for (const guild of guildCommand.guilds) {
          if (!guildCommandsByGuild[guild]) {
            guildCommandsByGuild[guild] = [];
          }

          const existingCommand = guildCommandsByGuild[guild].find(
            (cmd) => cmd.name == guildCommand.data.name
          );

          if (!existingCommand) {
            guildCommandsByGuild[guild].push(guildCommand.data);
          }
        }
      }

      for (const guild in guildCommandsByGuild) {
        try {
          const commands = guildCommandsByGuild[guild];
          await rest.put(Routes.applicationGuildCommands(clientID, guild), {
            body: commands,
          });
        } catch { }
      }

      client.logger.info(

        `[COMMAND MANAGER] Refreshed slash commands. `

      );
    } catch (error) {
      console.error(error);
    }
  };
};