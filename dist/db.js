"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
exports.addUser = addUser;
exports.userExists = userExists;
exports.userHasUid = userHasUid;
exports.getUserUid = getUserUid;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getUidInfos = getUidInfos;
exports.addUidInfos = addUidInfos;
exports.addCharacter = addCharacter;
exports.getCharacters = getCharacters;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
// Initialiser la base de données
const db = new better_sqlite3_1.default('database.sqlite', { verbose: console.log });
// Créer les tables si elles n'existent pas
const initializeDatabase = () => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            id_discord TEXT NOT NULL,
            uid_genshin TEXT NOT NULL
        )`)
        .run();
    db.prepare(`
        CREATE TABLE IF NOT EXISTS uid_infos (
            id TEXT PRIMARY KEY,
            uid TEXT NOT NULL,
            nickname TEXT,
            level INTEGER,
            signature TEXT,
            finishAchievementNum INTEGER,
            towerFloor TEXT,
            affinityCount INTEGER,
            theaterAct INTEGER,
            theaterMode TEXT,
            worldLevel INTEGER
        )`)
        .run();
    db.prepare(`
            CREATE TABLE IF NOT EXISTS players_characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid_genshin TEXT NOT NULL,
                character_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                element TEXT NOT NULL,
                level INTEGER NOT NULL,
                constellations INTEGER NOT NULL
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
// Ajouter un utilisateur à la base de données (id_discord, uid_genshin)
function addUser(user) {
    try {
        db.prepare(`
        INSERT INTO users (id_discord, uid_genshin)
        VALUES (?, ?)
    `).run(user.id_discord, user.uid_genshin);
        console.log("Utilisateur ajouté à la base de données. 😶‍🌫️");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}
// Vérifier si un utilisateur existe dans la base de données (id_discord)
function userExists(id_discord) {
    const user = db.prepare(`SELECT * FROM users 
        WHERE id_discord = ?`).get(id_discord);
    if (user === undefined)
        return false;
    return true;
}
// Vérifier si un utilisateur a cette UID d'enregistré (uid_genshin)
function userHasUid(uid_genshin) {
    const user = db.prepare(`SELECT * FROM users 
        WHERE uid_genshin = ?`).get(uid_genshin);
    if (user === undefined)
        return false;
    return true;
}
// Récupérer les informations d'un utilisateur (id_discord, uid_genshin)
function getUserUid(id_discord) {
    const uid_genshin = db.prepare(`SELECT uid_genshin FROM users 
        WHERE id_discord = ?`).get(id_discord);
    return uid_genshin?.uid_genshin || '';
}
// Modifier les informations d'un utilisateur (id_discord, uid_genshin)
function updateUser(user) {
    db.prepare(`
        UPDATE users
        SET uid_genshin = ?
        WHERE id_discord = ?
    `).run(user.uid_genshin, user.id_discord);
    console.log("Utilisateur mis à jour dans la base de données. 😶‍🌫️");
}
// Supprimer un utilisateur de la base de données (id_discord)
function deleteUser(id_discord) {
    db.prepare(`
        DELETE FROM users
        WHERE id_discord = ?
    `).run(id_discord);
    console.log("Utilisateur supprimé de la base de données. 😶‍🌫️");
}
// Récupérer les informations d'un utilisateur (uid_genshin)
function getUidInfos(uid_genshin) {
    const uid_infos = db.prepare(`SELECT * FROM uid_infos 
        WHERE uid = ?`).get(uid_genshin);
    return uid_infos;
}
// Ajouter les informations du compte de l'utilisateur dans la table uid_infos (uid_genshin)
function addUidInfos(uid_infos) {
    try {
        db.prepare(`
            INSERT INTO uid_infos (
                uid, nickname, level, signature, finishAchievementNum, towerFloor, affinityCount, theaterAct, theaterMode, worldLevel
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uid_infos.uid, uid_infos.nickname, uid_infos.level, uid_infos.signature, uid_infos.finishAchievementNum, uid_infos.towerFloor, uid_infos.affinityCount, uid_infos.theaterAct, uid_infos.theaterMode, uid_infos.worldLevel);
        console.log(`Informations ajoutées pour l'UID : ${uid_infos.uid}`);
        return true;
    }
    catch (error) {
        console.error(`Erreur lors de l'ajout des informations de l'UID ${uid_infos.uid}:`, error);
        return false;
    }
}
// Ajouter un personnages à la base de données (uid_genshin, character_id, name, element, level, stars, assets)
function addCharacter(character) {
    try {
        db.prepare(`
            INSERT INTO players_characters (
                uid_genshin, character_id, name, element, level, constellations
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(character.uid_genshin, character.character_id, character.name, character.element, character.level, character.constellations);
        console.log(`Personnage ajouté : ${character.name}`);
    }
    catch (error) {
        console.error(`Erreur lors de l'ajout du personnage ${character.name}:`, error);
    }
}
// Récupérer les personnages d'un utilisateur (uid_genshin)
function getCharacters(uid_genshin) {
    const characters = db.prepare(`SELECT * FROM players_characters 
        WHERE uid_genshin = ?`).all(uid_genshin);
    return characters;
}
