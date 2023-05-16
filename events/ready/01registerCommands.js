const { Server } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      Server
    );

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑 Befehl gelöscht: "${name}".`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(`🔁 Befehl geändert: "${name}".`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(
            `⏩ Überspringe befehl "${name}" da er auf löschen gesetzt ist.`
          );
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(`👍 Befehl Regestriert "${name}."`);
      }
    }
  } catch (error) {
    console.log(`Da ist ein Fehler beim registrieren: ${error}`);
  }
};
