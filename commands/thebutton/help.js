const { SlashCommandBuilder } = require('discord.js');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help me understand the button.')
        .setDMPermission(false),

    async execute(interaction) {                
        const msg = "A mysterious button appeared. After a while, it started flashing invitingly.\n\n" 
            + "Use `/inspect` to inspect it's status, or `/thebutton` to press it.\n"
            + "You can also use `/level` to check your current level of enlightenment.";

        logger.logInteraction(interaction, 'requested an intro');
        return interaction.reply({content: msg, ephemeral: interaction.user.id !== process.env.ADMINID});
    },
};