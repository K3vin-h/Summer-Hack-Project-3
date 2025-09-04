const fs = require("fs");

module.exports = (client) => {
  client.handleEvents = async () => {
    const eventFolders = fs.readdirSync(`./src/events`);
    for (const folder of eventFolders) {
      const eventFiles = fs
        .readdirSync(`./src/events/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of eventFiles) {
        const event = require(`../../events/${folder}/${file}`);

        if (folder === 'mongo') {
          // Special handling for MongoDB events
          event(client);
          client.logger.info(`Loaded MongoDB event: ${file}`);
        } else {
          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
          }
          client.logger.info(`[EVENT] Loaded ${folder}/${file}`);
        }
      }
    }
  };
};