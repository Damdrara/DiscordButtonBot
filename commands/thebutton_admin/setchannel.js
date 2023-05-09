const { SlashCommandBuilder } = require('discord.js');
const { setChannel } = require('../../lib/thebutton/db');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    disabled: true,
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('[ADMIN ONLY] Changes the channel the button resides in')
        .setDMPermission(false),

    async execute(interaction) {   
        await setChannel(interaction.guild, interaction.channelId);
                
        logger.logInteraction(interaction, 'set the channel.');
        return interaction.reply(`The button now resides in this channel.`);
    },
};