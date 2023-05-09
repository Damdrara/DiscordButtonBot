const sqlite3 = require('sqlite3');
let db = null;

const DB_FILE = 'db/thebutton.db';
const CREATE_STATEMENTS = [
    `CREATE TABLE guild (
        guildId TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        channelId TEXT DEFAULT NULL,
        counter INTEGER NOT NULL DEFAULT 0,
        lastPressTime INTEGER DEFAULT NULL
    );`,

    `CREATE TABLE guild_user (
        guildId TEXT NOT NULL,
        userId TEXT NOT NULL,
        userName TEXT NOT NULL,
        userNickname TEXT,
        serverNickname TEXT, 
        avatar TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 0,
        lastPressTime INTEGER DEFAULT NULL,
        PRIMARY KEY (guildId, userId),
        FOREIGN KEY (guildId)
            REFERENCES guild (guildId)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
    );`,

    `CREATE TABLE button_presses (
        guildId TEXT NOT NULL,
        userId TEXT NOT NULL,
        pressTime INTEGER NOT NULL,
        buttonLevel INTEGER NOT NULL,
        userLevelBefore INTEGER NOT NULL,
        userLevelAfter INTEGER NOT NULL,
        FOREIGN KEY (guildId)
            REFERENCES guild (guildId)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
    );`
];

async function getOrCreateGuild(guild) {
    const data = await getGuild(guild.id);
    if (data !== null) {
        return data;
    }

    await dbRun('INSERT INTO guild(guildId, name, icon) VALUES (?, ?, ?)', [guild.id, guild.name, guild.icon]);
    return getGuild(guild.id);
}

async function getGuild(guildId) {
    return dbGet(`SELECT * FROM guild WHERE guildId = ?`, [guildId]);
}

async function getOrCreateGuildMember(guild, member) {
    const data = await getGuildMember(guild.id, member.id);
    if (data !== null) {
        return data;
    }

    await dbRun('INSERT INTO guild_user(guildId, userId, userName, userNickname, serverNickname, avatar) VALUES (?, ?, ?, ?, ?, ?)', [guild.id, member.id, member.user.username, member.user.nickname, member.nickname, member.avatar ?? member.user.avatar]);
    return getGuildMember(guild.id, member.id);
}

async function getGuildMember(guildId, userId) {
    return dbGet(`SELECT * FROM guild_user WHERE guildId = ? AND userId = ?`, [guildId, userId]);
}

async function getTopUsers(guildId, cnt) {
    return dbAll(`SELECT * FROM guild_user WHERE guildId = ? ORDER BY level DESC, lastPressTime ASC LIMIT ?`, [guildId, cnt ?? 1]);
}



async function pressButton(guild, member, pressTime, buttonLevel, userLevelAfter) {
    await getOrCreateGuild(guild);
    const dBUser = await getOrCreateGuildMember(guild, member);

    return Promise.all([
        dbRun('UPDATE guild SET name = ?, icon = ?, counter = counter + 1, lastPressTime = ? WHERE guildId = ?', 
            [guild.name, guild.icon, pressTime, guild.id]),

        dbRun('UPDATE guild_user SET userName = ?, userNickname = ?, serverNickname = ?, avatar = ?, level = ?, lastPressTime = ? WHERE guildId = ? AND userId = ?', 
            [member.user.username, member.user.nickname, member.nickname, member.avatar ?? member.user.avatar, userLevelAfter, pressTime, guild.id, member.id]),

        dbRun('INSERT INTO button_presses (guildId, userId, pressTime, buttonLevel, userLevelBefore, userLevelAfter) VALUES (?,?,?,?,?,?)', 
            [guild.id, member.id, pressTime, buttonLevel, dBUser.level, userLevelAfter]),
    ]);
}

async function rebootButton(guildId) {
    return Promise.all([
        dbRun('DELETE FROM guild WHERE guildId = ?', [guildId]),
        dbRun('DELETE FROM guild_user WHERE guildId = ?', [guildId]),
        dbRun('DELETE FROM button_presses WHERE guildId = ?', [guildId]),
    ]);
}

async function setChannel(guild, channelId) {
    await getOrCreateGuild(guild);
    await dbRun('UPDATE guild SET name = ?, icon = ?, channelId = ? WHERE guildId = ?', [guild.name, guild.icon, channelId, guild.id]);
    return;
}



async function dbAll(statement, parameters) {
    return new Promise(function (resolve, reject) {
        db.all(statement, parameters, function (err, res) {
            if (err) {
                console.error("Error querying row:", err);
                process.exit(1);
            }
            resolve(res ?? null);
        });
    });
}

async function dbGet(statement, parameters) {
    return new Promise(function (resolve, reject) {
        db.get(statement, parameters, function (err, res) {
            if (err) {
                console.error("Error querying row:", err);
                process.exit(1);
            }
            resolve(res ?? null);
        });
    });
}

async function dbRun(statement, parameters) {
    return new Promise(function (resolve, reject) {
        db.run(statement, parameters, function (err) {
            if (err) {
                console.error("Error inserting rows:", err);
                process.exit(1);
            }
            resolve(this);
        });
    });
}



async function openDb() {
    return new Promise(function (resolve, reject) {
        db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READWRITE, (err) => {
            if (err && err.code === "SQLITE_CANTOPEN") {
                console.log('Button Database not found, creating...');
                resolve(createDb());
                return;
            }

            if (err) {
                console.error("Error opening database:", err);
                process.exit(1);
            }

            resolve(db);
        });
    });
}

async function createDb() {
    return new Promise(function (resolve, reject) {
        console.log('Creating database...');
        db = new sqlite3.Database(DB_FILE, async (err) => {
            if (err) {
                console.error("Error creating database:", err);
                process.exit(1);
            }

            console.log('Creating database tables...');
            for (const statement of CREATE_STATEMENTS) {
                await dbRun(statement)
            };
            
            console.log('Done!');
            resolve(db);
        });
    });
}

async function closeDb() {
    return new Promise(function (resolve, reject) {
        db.close((err) => {
            err ? reject(err) : resolve();
        });
    });
}



module.exports = {
    closeDb,
    getGuild,
    getGuildMember,
    getOrCreateGuild,
    getOrCreateGuildMember,
    getTopUsers,
    openDb,
    pressButton,
    rebootButton,
    setChannel,
}