"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.db = void 0;
exports.addUser = addUser;
exports.addUidInfos = addUidInfos;
exports.addCharacter = addCharacter;
exports.createProfile = createProfile;
exports.userExists = userExists;
exports.userHasUid = userHasUid;
exports.getUserUid = getUserUid;
exports.deleteUser = deleteUser;
exports.getUidInfos = getUidInfos;
exports.getCharacters = getCharacters;
exports.updateUidUser = updateUidUser;
exports.updateCharacter = updateCharacter;
exports.updateUidInfos = updateUidInfos;
exports.updateProfile = updateProfile;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const enkanetwork_js_1 = require("enkanetwork.js");
// Initialiser la base de données
exports.db = new better_sqlite3_1.default('database.sqlite');
// Créer les tables si elles n'existent pas
const initializeDatabase = () => {
    exports.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            id_discord TEXT NOT NULL,
            uid_genshin TEXT NOT NULL
        )`)
        .run();
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
    console.log("Base de données initialisée.");
};
exports.initializeDatabase = initializeDatabase;
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
        const characterExists = getCharacters(character.uid_genshin).find(c => c.character_id === character.character_id);
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
// Créer un profil 
async function createProfile(uid) {
    try {
        // Récupérer les informations du joueur
        const { genshin } = new enkanetwork_js_1.Wrapper();
        const playerData = await genshin.getPlayer(uid);
        // Vérifier si le joueur existe
        if (!playerData) {
            return false;
        }
        // Préparation des variables
        const towerFloor = playerData.player.abyss.floor + "-" + playerData.player.abyss.chamber + "-" + playerData.player.abyss.stars + '⭐';
        // Ajouter les informations de l'utilisateur
        const uid_infos = {
            uid: uid,
            nickname: playerData.player.username,
            level: Number(playerData.player.levels.rank),
            signature: playerData.player.signature,
            finishAchievementNum: playerData.player.achievements,
            towerFloor: towerFloor,
            affinityCount: playerData.player.maxFriendshipCount,
            theaterAct: Number(playerData.player.theaterAct),
            theaterMode: playerData.player.theaterMode,
            worldLevel: Number(playerData.player.levels.world),
            playerIcon: playerData.player.profilePicture.assets.icon,
        };
        // Ajouter les informations de l'utilisateur
        try {
            addUidInfos(uid_infos);
        }
        catch (error) {
            console.error("Erreur lors de l'ajout des informations de l'UID:", error);
            return false;
        }
        for (const characterData of playerData.player.showcase) {
            const character = {
                uid_genshin: uid,
                character_id: Number(characterData.characterId),
                name: characterData.name,
                element: characterData.element,
                level: Number(characterData.level),
                constellations: characterData.constellations,
                icon: characterData.assets.icon,
            };
            const characterExists = getCharacters(uid).find(c => c.character_id === character.character_id);
            if (characterExists) {
                try {
                    updateCharacter(character);
                }
                catch (error) {
                    console.error("Erreur lors de la mise à jour du personnage:", error);
                }
            }
            else {
                try {
                    addCharacter(character);
                }
                catch (error) {
                    console.error("Erreur lors de l'ajout du personnage:", error);
                }
            }
        }
        // console.log(`Mise à jour des informations pour l'utilisateur ${uid_infos.nickname} avec succès.`);
        return true;
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
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
/* ======================================================= GET ======================================================= */
// Récupérer les informations d'un utilisateur (id_discord, uid_genshin)
function getUserUid(id_discord) {
    const uid_genshin = exports.db.prepare(`SELECT uid_genshin FROM users 
        WHERE id_discord = ?`).get(id_discord);
    return uid_genshin?.uid_genshin || '';
}
// Supprimer un utilisateur de la base de données (id_discord)
function deleteUser(id_discord) {
    exports.db.prepare(`
        DELETE FROM users
        WHERE id_discord = ?
    `).run(id_discord);
    // console.log("Utilisateur supprimé de la base de données. 😶‍🌫️");
}
// Récupérer les informations d'un utilisateur (uid_genshin)
function getUidInfos(uid_genshin) {
    const uid_infos = exports.db.prepare(`SELECT * FROM uid_infos 
        WHERE uid = ?`).get(uid_genshin);
    return uid_infos;
}
// Récupérer les personnages d'un utilisateur (uid_genshin)
function getCharacters(uid_genshin) {
    const characters = exports.db.prepare(`SELECT * FROM players_characters 
        WHERE uid_genshin = ?`).all(uid_genshin);
    return characters;
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
// Modifier les informations d'un personnage (uid_genshin, character_id, name, element, level, stars, assets)
function updateCharacter(character) {
    try {
        // Obtenir les colonnes et les placeholders
        const columns = Object.keys(character).join(", ");
        const values = Object.values(character);
        // Construire la requête SQL sécurisée avec des placeholders
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
// Met à jour l'ensemble des informations d'un utilisateur
async function updateProfile(uid) {
    try {
        // Récupérer les informations du joueur
        const { genshin } = new enkanetwork_js_1.Wrapper();
        const playerData = await genshin.getPlayer(uid);
        // Vérifier si le joueur existe
        if (!playerData) {
            return false;
        }
        // Préparation des variables
        const towerFloor = playerData.player.abyss.floor + "-" + playerData.player.abyss.chamber + "-" + playerData.player.abyss.stars + '⭐';
        // Ajouter les informations de l'utilisateur
        const uid_infos = {
            uid: uid,
            nickname: playerData.player.username,
            level: Number(playerData.player.levels.rank),
            signature: playerData.player.signature,
            finishAchievementNum: playerData.player.achievements,
            towerFloor: towerFloor,
            affinityCount: playerData.player.maxFriendshipCount,
            theaterAct: Number(playerData.player.theaterAct),
            theaterMode: playerData.player.theaterMode,
            worldLevel: Number(playerData.player.levels.world),
            playerIcon: playerData.player.profilePicture.assets.icon,
        };
        // Vérifier si l'utilisateur existe déjà dans la base de données
        if (userHasUid(uid)) {
            try {
                updateUidInfos(uid_infos);
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
            }
        }
        // Ajouter le personnage au joueur
        for (const characterData of playerData.player.showcase) {
            const character = {
                uid_genshin: uid,
                character_id: Number(characterData.characterId),
                name: characterData.name,
                element: characterData.element,
                level: Number(characterData.level),
                constellations: characterData.constellations,
                icon: characterData.assets.icon,
            };
            // Vérifier si le personnage existe déjà dans la base de données
            const characterExists = getCharacters(uid).find(c => c.character_id === character.character_id);
            if (characterExists) {
                try {
                    updateCharacter(character);
                }
                catch (error) {
                    console.error("Erreur lors de la mise à jour du personnage:", error);
                }
            }
            else {
                try {
                    addCharacter(character);
                }
                catch (error) {
                    console.error("Erreur lors de l'ajout du personnage:", error);
                }
            }
        }
        // console.log(`Mise à jour des informations pour l'utilisateur ${uid_infos.nickname} avec succès.`);
        return true;
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
        return false;
    }
}
