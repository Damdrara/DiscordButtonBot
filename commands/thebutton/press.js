const { SlashCommandBuilder } = require('discord.js');
const { getOrCreateGuild, getOrCreateGuildMember, getTopUsers, pressButton } = require('../../lib/thebutton/db');
const { updateStatus } = require('../../lib/thebutton/button');
const { calculateLevel } = require('../../lib/thebutton/level');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('thebutton')
        .setDescription(`Press the button!`)
        .setDMPermission(false),

    async execute(interaction) {    
        const guild = await getOrCreateGuild(interaction.guild);
        const user = await getOrCreateGuildMember(interaction.guild, interaction.member);
        const topUserBefore = (await getTopUsers(interaction.guildId, 1))[0];

        const now = Date.now();
        const buttonLevel = calculateLevel(guild.lastPressTime, now);        
        const displayName = `${interaction.member.nickname ?? interaction.user.nickname ?? interaction.user.username} [${user.level}]`;
        
        let msg = `${displayName} pressed the button! ` + getPressedMsg(guild);
    
        if (buttonLevel === 0) {
            logger.logInteraction(interaction, 'pressed the inactive button.');
            
        } else if (buttonLevel > user.level) {
            msg += `\nThey are now level ${buttonLevel}.`;
            const diff = buttonLevel - user.level;
            if (diff >= 10) {
                msg += ` What a leap! A round of applause for them!`;
            } else if (diff >= 5) {
                msg += ` They showed some real patience here!`;
            } else if (diff == 1) {
                msg += ` Babysteps!`;
            } 

            await pressButton(interaction.guild, interaction.member, now, buttonLevel, buttonLevel);
            logger.logInteraction(interaction, `(level ${user.level}) pressed the button and reached level ${buttonLevel} (+${diff})`);

            const topUserAfter = (await getTopUsers(interaction.guildId, 1))[0];      
            if (topUserAfter.userId === interaction.user.id) {
                if (topUserBefore && topUserBefore.level > 0 && topUserAfter.userId === topUserBefore.userId) {
                    msg += `\nThey're strengthening their lead!`;
                    logger.logInteraction(interaction, `is strengthening their lead!`);
                } else {
                    msg += `\nThey're in the lead now!`;
                    logger.logInteraction(interaction, `is now in the lead!`);
                }
            }

        } else {
            msg += `\nPressing the button early to deny others is not a very enlightened move.`;
            chance = 40 + (Math.max(0, 10 - user.level)*6);
            if (Math.floor(Math.random() * 100) < chance) {
                await pressButton(interaction.guild, interaction.member, now, buttonLevel, user.level);

                msg += ` This time they escaped the punishment though.`;
                logger.logInteraction(interaction, `(level ${user.level}) reset the button at level ${buttonLevel}. It went unpunished.`);
                
            } else {
                punishedLevel = Math.max(0, user.level - 1);
                await pressButton(interaction.guild, interaction.member, now, buttonLevel, punishedLevel);

                msg += ` They have been punished and are now level ${punishedLevel}.`;                
                logger.logInteraction(interaction, `(level ${user.level}) reset the button at level ${buttonLevel} and were punished for it.`);
            }            
        }    

        updateStatus(interaction.guild);
        return interaction.reply(msg);
    },
};

function getPressedMsg(guild) {    
    const buttonLevel = calculateLevel(guild.lastPressTime);
    if (buttonLevel === 0) {
        return `The button was not flashing. Nothing is happening.`;
    }

    if (!guild.lastPressTime) {
        return `The button beeps and flashes once, then resets.`;
    }
        
    return `The button beeps and flashes ${buttonLevel} times in a row, then resets.`;
}