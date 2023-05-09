const { formatDistance }  = require('date-fns');
const { SlashCommandBuilder } = require('discord.js');
const { getOrCreateGuild, getOrCreateGuildMember } = require('../../lib/thebutton/db');
const { calculateLevel } = require('../../lib/thebutton/level');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {    
    data: new SlashCommandBuilder()
        .setName('inspect')
        .setDescription('Inspect the button closely')
        .setDMPermission(false),

    async execute(interaction) {   
        const guild = await getOrCreateGuild(interaction.guild);
        const user = await getOrCreateGuildMember(interaction.guild, interaction.member);
                
        const statusMsg = getStatusMsg(guild, user);

        logger.logInteraction(interaction, 'inspects the button.');
        
        return interaction.reply(statusMsg);
    },
};

function getStatusMsg(guild, user) {    
    const buttonLevel = calculateLevel(guild.lastPressTime);
    if (buttonLevel === 0) {
        return `The button is not flashing.`;
    }
    
    if (!guild.lastPressTime) {
        return `The button has never been clicked before and is occasionally flashing invitingly.`;   
    } 
    
    const timeFormated = formatDistance(guild.lastPressTime, Date.now(), { addSuffix: true, includeSeconds: true });        
    const timeMsg = `The button was last pressed ${timeFormated}`;
    
    let msg = `${timeMsg}. It is occasionally flashing ${buttonLevel} times in a row, before again waiting to be pressed.`;  
    if (buttonLevel - user.level > 10) {
        msg += ` The button looks extremely tempting to you now.`;
    } else if (buttonLevel - user.level > 5) {
        msg += ` The button looks real tempting to you now.`;
    } else if (buttonLevel - user.level > 0) {
        msg += ` The button is starting to look tempting to you.`;
    }

    return msg;
}