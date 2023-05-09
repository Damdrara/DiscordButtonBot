const { format }  = require('date-fns');
const { SlashCommandBuilder } = require('discord.js');
const { loadGuildDb } = require('../../lib/thebutton/db');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('thebutton_intro')
        .setDescription('What is this!? Give me an intro to this madness!')
        .setDMPermission(false),

    async execute(interaction) {                
        const msg = "A mysterious button appeared. After a while, it started flashing invitingly.\n\n" 
            + "Use `/thebutton_inspect` to inspect it's status, or `/thebutton` to press it.\n"
            + "You can also use `/thebutton_level` to check your current level of enlightenment.";

        logger.logInteraction(interaction, 'requested an intro');
        return interaction.reply({content: msg, ephemeral: interaction.user.id !== process.env['adminId']});
    },
};