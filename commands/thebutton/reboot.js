const { format }  = require('date-fns');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { saveGuildDb } = require('../../lib/thebutton/db');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('thebutton_reboot')
        .setDescription(`[ADMIN COMMAND] Reboot the button. Careful, this resets everyone's progress!`)
        .setDMPermission(false)
	    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {            
        await saveGuildDb(interaction.guild.id, {});
    
        logger.logInteraction(interaction, 'rebooted the button.');
        return interaction.reply({ content: `The button has been rebooted, the slate has been wiped clean.`, ephemeral: false });
    },
};