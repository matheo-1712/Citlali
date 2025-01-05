"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUid = exports.getUidInfos = exports.getUidByUid = exports.getUid = exports.initializeDatabase = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
// Initialiser la base de données
const db = new better_sqlite3_1.default('database.sqlite', { verbose: console.log });
// Créer les tables si elles n'existent pas
const initializeDatabase = () => {
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
exports.initializeDatabase = initializeDatabase;
const getUid = (id_discord) => {
    const stmt = db.prepare(`SELECT uid FROM uid WHERE id_discord = ?`);
    return stmt.get(id_discord);
};
exports.getUid = getUid;
const getUidByUid = (uid) => {
    const stmt = db.prepare(`SELECT * FROM uid WHERE uid = ?`);
    return stmt.get(uid);
};
exports.getUidByUid = getUidByUid;
const getUidInfos = (uid) => {
    const stmt = db.prepare(`SELECT * FROM uid_infos WHERE uid = ?`);
    return stmt.get(uid);
};
exports.getUidInfos = getUidInfos;
const setUid = (id_discord, uid) => {
    const stmt = db.prepare(`INSERT INTO uid (id_discord, uid) VALUES (?, ?)`);
    stmt.run(id_discord, uid);
};
exports.setUid = setUid;
