const { format }  = require('date-fns');
const { SlashCommandBuilder } = require('discord.js');
const { getDbInstance, loadGuildDb, saveGuildDb } = require('../../lib/thebutton/db');
const { calculateLevel, getPressedMsg } = require('../../lib/thebutton/button');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('thebutton')
        .setDescription(`Press it!`)
        .setDMPermission(false),

    async execute(interaction) {          
        const db = getDbInstance();
        const guildDb = await loadGuildDb(interaction.guild.id, db);    
        const now = Date.now();
        const newLevel = calculateLevel(guildDb.lastClick, now);
        
        const currentLevel = guildDb.users[interaction.user.id] ?? 0;
        const displayName = `${interaction.user.username} (${currentLevel})`;
        
        let msg = `${displayName} pressed the button! ` + getPressedMsg(guildDb.lastClick, now);
        const logPrefix = `[` + format(now, 'yyyy-MM-dd HH:mm:ss') + ` @ ${interaction.guild.name}]`;
    
        if (newLevel === 0) {
            logger.logInteraction(interaction, 'pressed the inactive button.');
            
        } else if (newLevel > currentLevel) {
            msg += `\nThey are now level ${newLevel}.`;
            const diff = newLevel-currentLevel;
            if (diff >= 10) {
                msg += ` What a leap! A round of applause for ${interaction.user.username}!`;
            } else if (diff >= 5) {
                msg += ` They showed some real patience here!`;
            } else if (diff == 1) {
                msg += ` Babysteps!`;
            } 
            
            guildDb.users[interaction.user.id] = newLevel;
            logger.logInteraction(interaction, `(level ${currentLevel}) pressed the button and reached level ${newLevel} (+${diff})`);
        } else {
            msg += `\nPressing the button early to deny others is not a very enlightened move.`;
            chance = 40 + (Math.max(0, 10 - currentLevel)*6);
            if (Math.floor(Math.random() * 100) < chance) {
                msg += ` This time they escaped the punishment though.`;
                logger.logInteraction(interaction, `(level ${currentLevel}) reset the button at level ${newLevel}. It went unpunished.`);
                
            } else {
                punishedLevel = Math.max(0, currentLevel - 1);
                msg += ` They have been punished and are now level ${punishedLevel}.`;
                guildDb.users[interaction.user.id] = punishedLevel;
                
                logger.logInteraction(interaction, `(level ${currentLevel}) reset the button at level ${newLevel} and were punished for it.`);
            }
            
        }    
    
        guildDb.clicks++;
        guildDb.lastClick = now;
        guildDb.lastClickById = interaction.user.id;
        guildDb.lastClickByName = interaction.user.username;
    
        const highestClick = guildDb.highestClick ?? 0;
        if (highestClick < newLevel) {
            msg += `\nThey're in the lead now!`;
            guildDb.highestClick = newLevel;
            guildDb.highestClickById = interaction.user.id;
            guildDb.highestClickByName = interaction.user.username;
            logger.logInteraction(interaction, `is now in the lead!`);
        }
        
        await saveGuildDb(interaction.guild.id, guildDb, db);
        
        return interaction.reply(msg);
    },
};