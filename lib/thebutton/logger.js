const { format }  = require('date-fns');

module.exports = {
    logger: {
        logInteraction: function (interaction, msg) {
            let prefix = format(Date.now(), 'yyyy-MM-dd HH:mm:ss');
            if (interaction.guild && interaction.guild.name) {
                prefix += ` @ ${interaction.guild.name}`;
            }
                
            const displayName = getDisplayNameForLogging(interaction);
            console.log(`[${prefix}] ${displayName} ${msg}`);
        },
            
        log: function (msg, guildName) {
            let prefix = format(Date.now(), 'yyyy-MM-dd HH:mm:ss');
            if (guildName) {
                prefix += ` @ ${guildName}`;
            }
    
            console.log(`[${prefix}] ${msg}`);
        }
    }
}

function getDisplayNameForLogging(interaction) {
    const userName = interaction.user.username;
    const userNickname = interaction.user.nickname;
    const serverNickname = interaction.member.nickname;
    
    if (serverNickname && serverNickname !== userName) {
        return `${serverNickname} (${userName})`;
    }

    if (userNickname && userNickname !== userName) {
        return `${userNickname} (${userName})`;
    }

    return userName;
}