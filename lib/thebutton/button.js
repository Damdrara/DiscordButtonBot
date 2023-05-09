const { getOrCreateGuild } = require('./db');
const { calculateLevel, nextLevelTimeout } = require('./level');
const { logger } = require('../../lib/thebutton/logger');

module.exports = {
    updateStatus
}

let timeout = {};

async function updateStatus(discordGuild) {
    if (discordGuild.id in timeout) {
        clearTimeout(timeout[discordGuild.id]);
    }

    const dbGuild = await getOrCreateGuild(discordGuild);    
    discordGuild = await discordGuild.client.guilds.fetch(discordGuild.id);  
    const level = calculateLevel(dbGuild.lastPressTime);

    logger.log('The button is now level ' + level, discordGuild.name);

    const timeUntilNextLevel = nextLevelTimeout(dbGuild.lastPressTime);
    timeout[discordGuild.id] = setTimeout(() => updateStatus(discordGuild), timeUntilNextLevel);
    timeout[discordGuild.id].unref();
}