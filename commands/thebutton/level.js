const { format }  = require('date-fns');
const { SlashCommandBuilder } = require('discord.js');
const { loadGuildDb } = require('../../lib/thebutton/db');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('thebutton_level')
        .setDescription(`Check what level the button has granted you`)
        .setDMPermission(false),

    async execute(interaction) {                
        const guildDb = await loadGuildDb(interaction.guild.id);    
        let msg = `You are currently level ${guildDb.users[interaction.user.id] ?? 0}.`;
        if (interaction.user.id === guildDb.highestClickById) {
            msg +- ` You are in the lead!`;
        }
                
        logger.logInteraction(interaction, `checked their level: ` + msg);
        return interaction.reply(msg);
    },
};