const { format }  = require('date-fns');
const { SlashCommandBuilder } = require('discord.js');
const { getDbInstance, loadGuildDb, saveGuildDb } = require('../../lib/thebutton/db');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    disabled: true,
    data: new SlashCommandBuilder()
        .setName('thebutton_channel')
        .setDescription('Changes the channel the button resides in.')
        .setDMPermission(false),

    async execute(interaction) {                
        const db = getDbInstance();
        const guildDb = await loadGuildDb(interaction.guild.id, db);
        
        guildDb.channelId = interaction.channelId;
        await saveGuildDb(interaction.guild.id, guildDb, db);
        
        logger.logInteraction(interaction, 'set the channel.');
        return interaction.reply(`The button now resides in this channel.`);
    },
};