const { format }  = require('date-fns');
const { SlashCommandBuilder } = require('discord.js');
const { loadGuildDb } = require('../../lib/thebutton/db');
const { getStatusMsg } = require('../../lib/thebutton/button');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {    
    data: new SlashCommandBuilder()
        .setName('thebutton_inspect')
        .setDescription('Inspect the button')
        .setDMPermission(false),

    async execute(interaction) {        
        const guildDb = await loadGuildDb(interaction.guild.id);    
        const statusMsg = getStatusMsg(
            guildDb.lastClick,
            guildDb.users[interaction.user.id] ?? 0
        );

        logger.logInteraction(interaction, `inspects: ${statusMsg}`);
        
        return interaction.reply(statusMsg);
    },
};