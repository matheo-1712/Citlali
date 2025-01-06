"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
exports.addUser = addUser;
exports.userExists = userExists;
exports.userHasUid = userHasUid;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.addCharacter = addCharacter;
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
            level TEXT,
            signature TEXT,
            finishAchievementNum TEXT,
            towerFloor TEXT,
            theaterAct TEXT,
            fetterCount TEXT
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
                stars INTEGER NOT NULL,
                assets TEXT NOT NULL
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
function getUser(id_discord) {
    const user = db.prepare(`SELECT * FROM users 
        WHERE id_discord = ?`).get(id_discord);
    return user;
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
// TODO : Ajouter un personnages à la base de données (uid_genshin, character_id, name, element, level, stars, assets)
function addCharacter(character) {
    try {
        db.prepare(`
            INSERT INTO players_characters (
                uid_genshin, character_id, name, element, level, stars, assets
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(character.uid_genshin, character.character_id, character.name, character.element, character.level, character.stars, JSON.stringify(character.assets) // Sauvegarde les assets comme JSON
        );
        console.log(`Personnage ajouté : ${character.name}`);
    }
    catch (error) {
        console.error(`Erreur lors de l'ajout du personnage ${character.name}:`, error);
    }
}
