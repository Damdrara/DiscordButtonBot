require('dotenv').config();
const { REST, Routes } = require('discord.js');
const token = process.env.TOKEN;
const clientId = process.env.CLIENTID;

const fs = require('node:fs');
const path = require('node:path');
const publicCommands = [];
const guildCommands = {};

// const guildIds = [];
// for (const guildId of guildIds) {
//     guildCommands[guildId] = [];
// }

// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('disabled' in command && command.disabled) {
      console.log(`[INFO] The command at ${filePath} is disabled.`);

    } else if ('data' in command && 'execute' in command) {
      if ('guildIds' in command && command.guildIds.length) {
        for (const guildId of command.guildIds) {
            if (!guildCommands[guildId]) {
              guildCommands[guildId] = [];
            }
            guildCommands[guildId].push(command.data.toJSON());
        }
          
      } else {
        publicCommands.push(command.data.toJSON());
      }
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    for (const guildId in guildCommands) {
      console.log(`Started refreshing ${guildCommands.length ?? 0} guild application (/) commands for guild ${guildId}.`);

      // The put method is used to fully refresh all commands in the guild with the current set
      const guildData = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: guildCommands[guildId] },
      );

      console.log(`-> Successfully reloaded ${guildData.length} guild application (/) commands for guild ${guildId}.`);
    }

    console.log(`Started refreshing ${publicCommands.length} public application (/) commands.`);
    if (publicCommands.length) {
      // The put method is used to fully refresh all commands in the guild with the current set
      const publicData = await rest.put(
        Routes.applicationCommands(clientId),
        { body: publicCommands },
      );

      console.log(`-> Successfully reloaded ${publicData.length} public application (/) commands.`);
    } else {
      console.log(`-> No public application (/) commands to deploy.`);
    }
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
