const { format }  = require('date-fns');

module.exports = {
    logger: {
        logInteraction: function (interaction, msg) {
            let prefix = format(Date.now(), 'yyyy-MM-dd HH:mm:ss');
            if (interaction.guild && interaction.guild.name) {
                prefix += ` @ ${interaction.guild.name}`;
            }
    
            console.log(`[${prefix}] ${interaction.user.username} ${msg}`);
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