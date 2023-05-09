const { SlashCommandBuilder } = require('discord.js');
const { getOrCreateGuildMember, getTopUsers } = require('../../lib/thebutton/db');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription(`Check what level the button has granted you`)
        .setDMPermission(false),

    async execute(interaction) {     
        const user = await getOrCreateGuildMember(interaction.guild, interaction.member);
        const topUser = await getTopUsers(interaction.guildId, 1);

        let msg = `You are currently level ${user.level}.`;
        if (topUser.length && interaction.user.id === topUser[0].userId) {
            msg += ` You are in the lead!`;
        }
                
        logger.logInteraction(interaction, `checked their level: ` + msg);
        return interaction.reply(msg);
    },
};