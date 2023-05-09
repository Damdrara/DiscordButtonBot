const Database = require("@replit/database");

module.exports = {
    getDbInstance: function() {
        return new Database();
    },
    
    saveGuildDb: async function(guildId, guildDb, db) {
        db = db ?? new Database();
        const guildDbKey = "guild_" + guildId;
        return db.set(guildDbKey, JSON.stringify(guildDb));
    },

    loadGuildDb: async function(guildId, db) {    
        db = db ?? new Database();        
        const guildDbKey = "guild_" + guildId;
        const guildDb = JSON.parse(await db.get(guildDbKey)) ?? {};                
        guildDb.clicks = guildDb.clicks ?? 0;
        guildDb.lastClick = guildDb.lastClick ?? null;
        guildDb.users = guildDb.users || {};
        
        return guildDb;
    }
}
