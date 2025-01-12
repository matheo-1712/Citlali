"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.db = void 0;
exports.addUser = addUser;
exports.addUidInfos = addUidInfos;
exports.addCharacter = addCharacter;
exports.addInfographic = addInfographic;
exports.userExists = userExists;
exports.userHasUid = userHasUid;
exports.userHasUidInfos = userHasUidInfos;
exports.userHasCharacter = userHasCharacter;
exports.characterHasInfographic = characterHasInfographic;
exports.getUserUid = getUserUid;
exports.getUidInfos = getUidInfos;
exports.getPlayerCharacters = getPlayerCharacters;
exports.getCharactersList = getCharactersList;
exports.getCharacterInfos = getCharacterInfos;
exports.getCharacterBuilds = getCharacterBuilds;
exports.updateUidUser = updateUidUser;
exports.updateCharacter = updateCharacter;
exports.updateUidInfos = updateUidInfos;
exports.updateInfographic = updateInfographic;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = require("path");
// Initialiser la base de données
exports.db = new better_sqlite3_1.default('database.sqlite');
// Créer les tables si elles n'existent pas
const initializeDatabase = () => {
    // Création de la table users
    exports.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            id_discord TEXT NOT NULL,
            uid_genshin TEXT NOT NULL
        )`)
        .run();
    // Création de la table uid_infos
    exports.db.prepare(`
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
            worldLevel INTEGER,
            playerIcon TEXT
        )`)
        .run();
    // Création de la table players_characters
    exports.db.prepare(`
            CREATE TABLE IF NOT EXISTS players_characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid_genshin TEXT NOT NULL,
                character_id INTEGER,
                name TEXT NOT NULL,
                element TEXT,
                level INTEGER,
                constellations INTEGER,
                icon TEXT
            )
        `).run();
    // Création de la table characters
    exports.db.prepare(`
            CREATE TABLE IF NOT EXISTS characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                weapon TEXT NOT NULL,
                vision TEXT NOT NULL,
                region TEXT NOT NULL,
                portraitLink TEXT NOT NULL,
                value TEXT NOT NULL
            )
        `).run();
    // Création de la table infographics
    exports.db.prepare(`
            CREATE TABLE IF NOT EXISTS infographics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                character TEXT NOT NULL,
                build TEXT NOT NULL,
                url TEXT NOT NULL
            )
        `).run();
    // Récupérer les données des personnages depuis le fichier characters.json
    const characters = require(`${(0, path_1.dirname)(__dirname)}/characters.json`).characters;
    // Ajouter les données des personnages dans la table characters seulement si elles n'existent pas déjà
    characters.forEach((character) => {
        const characterExists = exports.db.prepare(`
                SELECT * FROM characters
                WHERE name = ?
            `).get(character.name);
        if (!characterExists) {
            exports.db.prepare(`
                    INSERT INTO characters (name, weapon, vision, region, portraitLink, value)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(character.name, character.weapon, character.vision, character.region, character.portraitLink, character.value);
        }
    });
    console.log("Base de données initialisée.");
};
exports.initializeDatabase = initializeDatabase;
// TODO : Repasser sur chaque fonction pour compacter les fonctions identiques et rendre le code plus lisible possible
/* ======================================================= ADD ======================================================= */
// Ajouter un utilisateur à la base de données (id_discord, uid_genshin)
function addUser(user) {
    try {
        // Obtenir les colonnes et les placeholders
        const columns = Object.keys(user).join(", ");
        const placeholders = Object.keys(user).map(() => "?").join(", ");
        const values = Object.values(user);
        // Construire la requête SQL sécurisée avec des placeholders
        const query = `INSERT INTO users (${columns}) VALUES (${placeholders})`;
        // Exécuter la requête avec les valeurs
        exports.db.prepare(query).run(...values);
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}
// Ajouter les informations du compte de l'utilisateur dans la table uid_infos (uid_genshin)
function addUidInfos(uid_infos) {
    try {
        // Obtenir les colonnes et les placeholders
        const columns = Object.keys(uid_infos).join(", ");
        const placeholders = Object.keys(uid_infos).map(() => "?").join(", ");
        const values = Object.values(uid_infos);
        // Construire la requête SQL sécurisée avec des placeholders
        const query = `INSERT INTO uid_infos (${columns}) VALUES (${placeholders})`;
        // Exécuter la requête avec les valeurs
        exports.db.prepare(query).run(...values);
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
        // Obtenir les colonnes et les placeholders
        const columns = Object.keys(character).join(", ");
        const placeholders = Object.keys(character).map(() => "?").join(", ");
        const values = Object.values(character);
        // Avant d'ajouter le personnage, vérifier si le personnage existe déjà pour cette UID
        const characterExists = getPlayerCharacters(character.uid_genshin).find(c => c.character_id === character.character_id);
        if (characterExists) {
            return false;
        }
        // Construire la requête SQL sécurisée avec des placeholders
        const query = `INSERT INTO players_characters (${columns}) VALUES (${placeholders})`;
        // Exécuter la requête avec les valeurs
        exports.db.prepare(query).run(...values);
        return true;
    }
    catch (error) {
        console.error(`Erreur lors de l'ajout du personnage ${character.name}:`, error);
        return false;
    }
}
// Ajouter un infographie à la base de données (character, build, url)
function addInfographic(infographic) {
    try {
        // Obtenir les colonnes et les placeholders
        const columns = Object.keys(infographic).join(", ");
        const placeholders = Object.keys(infographic).map(() => "?").join(", ");
        const values = Object.values(infographic);
        // Construire la requête SQL sécurisée avec des placeholders
        const query = `INSERT INTO infographics (${columns}) VALUES (${placeholders})`;
        // Exécuter la requête avec les valeurs
        exports.db.prepare(query).run(...values);
        return true;
    }
    catch (error) {
        console.error(`Erreur lors de l'ajout de l'infographie ${infographic.character}:`, error);
        return false;
    }
}
/* ======================================================= Boolean ======================================================= */
// Vérifier si un utilisateur existe dans la base de données (id_discord)
function userExists(id_discord) {
    const user = exports.db.prepare(`SELECT * FROM users 
        WHERE id_discord = ?`).get(id_discord);
    if (user === undefined)
        return false;
    return true;
}
// Vérifier si un utilisateur a cette UID d'enregistré (uid_genshin)
function userHasUid(uid_genshin) {
    const user = exports.db.prepare(`SELECT * FROM users 
        WHERE uid_genshin = ?`).get(uid_genshin);
    if (user === undefined)
        return false;
    return true;
}
// Vérifier si l'utilisateur a déjà les informations d'un UID enregistré
function userHasUidInfos(uid_genshin) {
    const user = exports.db.prepare(`SELECT * FROM uid_infos 
        WHERE uid = ?`).get(uid_genshin);
    if (user === undefined)
        return false;
    return true;
}
// Vérifier si l'utilisateur a déjà ce personnage enregistré
function userHasCharacter(uid_genshin, character_id) {
    const user = exports.db.prepare(`SELECT * FROM players_characters 
        WHERE uid_genshin = ? AND character_id = ?`).get(uid_genshin, character_id);
    if (user === undefined)
        return false;
    return true;
}
// Vérifier si l'infographie existe dans la base de données (character, build)
function characterHasInfographic(character, build) {
    const user = exports.db.prepare(`SELECT * FROM infographics 
        WHERE character = ? AND build = ?`).get(character, build);
    if (user === undefined)
        return false;
    return true;
}
/* ======================================================= GET ======================================================= */
// Récupérer les informations d'un utilisateur (id_discord, uid_genshin)
function getUserUid(id_discord) {
    const uid_genshin = exports.db.prepare(`SELECT uid_genshin FROM users 
        WHERE id_discord = ?`).get(id_discord);
    return uid_genshin?.uid_genshin || '';
}
// Récupérer les informations d'un utilisateur (uid_genshin)
function getUidInfos(uid_genshin) {
    const uid_infos = exports.db.prepare(`SELECT * FROM uid_infos 
        WHERE uid = ?`).get(uid_genshin);
    return uid_infos;
}
// Récupérer les personnages d'un utilisateur (uid_genshin)
function getPlayerCharacters(uid_genshin) {
    const characters = exports.db.prepare(`SELECT * FROM players_characters 
        WHERE uid_genshin = ?`).all(uid_genshin);
    return characters;
}
// Récupérer la liste des personnages 
function getCharactersList() {
    const characters = exports.db.prepare(`SELECT * FROM characters`).all();
    return characters;
}
function getCharacterInfos(value) {
    const character = exports.db.prepare(`SELECT * FROM characters 
        WHERE value = ?`).get(value);
    return character;
}
function getCharacterBuilds(name) {
    const builds = exports.db.prepare(`SELECT * FROM infographics 
        WHERE character = ?`).all(name);
    return builds;
}
/* ======================================================= UPDATE ======================================================= */
// Modifier les informations d'un utilisateur (id_discord, uid_genshin)
function updateUidUser(user) {
    try {
        exports.db.prepare(`
        UPDATE users
        SET uid_genshin = ?
        WHERE id_discord = ?
    `).run(user.uid_genshin, user.id_discord);
        return true;
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        return false;
    }
    // console.log("Utilisateur mis à jour dans la base de données. 😶‍🌫️");
}
function updateCharacter(character) {
    try {
        // Obtenir les colonnes et leurs placeholders pour la mise à jour
        const columns = Object.keys(character)
            .filter(key => key !== 'uid_genshin' && key !== 'character_id') // Exclure les conditions de la requête
            .map(key => `${key} = ?`)
            .join(", ");
        // Vérifier si des colonnes existent pour la mise à jour
        if (!columns) {
            throw new Error("Aucune donnée valide à mettre à jour.");
        }
        // Préparer les valeurs pour les colonnes à mettre à jour
        const values = Object.keys(character)
            .filter(key => key !== 'uid_genshin' && key !== 'character_id')
            .map(key => character[key]);
        // Ajouter les valeurs des conditions à la fin (uid_genshin et character_id)
        values.push(character.uid_genshin, character.character_id);
        // Construire la requête SQL sécurisée
        const query = `UPDATE players_characters SET ${columns} WHERE uid_genshin = ? AND character_id = ?`;
        // Exécuter la requête avec les valeurs
        exports.db.prepare(query).run(...values);
        return true;
    }
    catch (error) {
        console.error(`Erreur lors de la modification du personnage ${character.name}:`, error);
        return false;
    }
}
// Mettre à jour l'ensemble des informations d'un joueur (table UID_infos)
function updateUidInfos(uid_infos) {
    try {
        // Récupérer les clés (noms des colonnes) et les valeurs
        const columns = Object.keys(uid_infos).filter(key => key !== 'uid');
        const values = Object.values(uid_infos).filter(value => value !== uid_infos.uid);
        // Construire les parties de la requête SQL (colonne = ?)
        const setClause = columns.map(column => `${column} = ?`).join(", ");
        // Ajouter l'UID à la fin de la requête pour la condition WHERE
        const query = `UPDATE uid_infos SET ${setClause} WHERE uid = ?`;
        // Exécuter la requête avec les valeurs
        exports.db.prepare(query).run(...values, uid_infos.uid);
        return true;
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
        return false;
    }
}
function updateInfographic(infographic) {
    try {
        // Obtenir les colonnes et les placeholders pour la mise à jour
        const columns = Object.keys(infographic).filter(key => key !== 'character' && key !== 'build');
        const values = Object.values(infographic).filter(value => value !== infographic.character && value !== infographic.build);
        // Construire les parties de la requête SQL (colonne = ?)
        const setClause = columns.map(column => `${column} = ?`).join(", ");
        // Ajouter l'UID à la fin de la requête pour la condition WHERE
        const query = `UPDATE infographics SET ${setClause} WHERE character = ? AND build = ?`;
        // Exécuter la requête avec les valeurs
        exports.db.prepare(query).run(...values, infographic.character, infographic.build);
        return true;
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour de l'infographie:", error);
        return false;
    }
}
