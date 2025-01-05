import Database from 'better-sqlite3';

// Initialiser la base de données
const db = new Database('database.sqlite', { verbose: console.log });

// Créer les tables si elles n'existent pas
export const initializeDatabase = () => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS uid (
            id TEXT PRIMARY KEY,
            id_discord TEXT NOT NULL,
            uid TEXT NOT NULL
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS uid_infos (
            id TEXT PRIMARY KEY,
            uid TEXT NOT NULL,
            nickname TEXT,
            level TEXT,
            signature TEXT,
            finishAchievementNum TEXT,
            towerFloor TEXT,
            theaterAct TEXT,
            fetterCount TEXT
        )
    `).run();

    /* 
        towerFloor - étage des abysses
        theaterAct - acte du théâtre
        fetterCount - nombre d'affinité des personnages
    */

    console.log("Base de données initialisée.");
};

export const getUid = (id_discord: string) => {
    const stmt = db.prepare(`SELECT uid FROM uid WHERE id_discord = ?`);
    return stmt.get(id_discord);
};

export const getUidByUid = (uid: string) => {
    const stmt = db.prepare(`SELECT * FROM uid WHERE uid = ?`);
    return stmt.get(uid);
};

export const getUidInfos = (uid: string) => {
    const stmt = db.prepare(`SELECT * FROM uid_infos WHERE uid = ?`);
    return stmt.get(uid);
};

export const setUid = (id_discord: string, uid: string) => {
    const stmt = db.prepare(`INSERT INTO uid (id_discord, uid) VALUES (?, ?)`);
    stmt.run(id_discord, uid);
};

