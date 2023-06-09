require('dotenv').config();
require("@replit/database");
const button = require('./lib/thebutton/button');
const { openDb } = require('./lib/thebutton/db');

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const token = process.env.TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
    if ('disabled' in command && command.disabled) {
      console.log(`[WARNING] The command at ${filePath} is disabled.`);
      
    } else if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, async () => {
	console.log('Logged in!');
	
	const guilds = await client.guilds.fetch();
	console.log('TheButton currently resides in these guilds:');
	guilds.each(async function (guild) {
		console.log('- ' + guild.name + ' (' + guild.id + ')');
		button.updateStatus(guild);
	});	
});

client.once(Events.GuildCreate, async (guild) => {
	console.log('Joined Guild: ' + guild.name + ' (' + guild.id + ')');
	button.updateStatus(guild);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

(async function() { 
	await openDb(); 	
	client.login(token);
})();
