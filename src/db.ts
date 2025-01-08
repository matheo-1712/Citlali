import Database from 'better-sqlite3';
import { Character, UidInfos, User } from './types';
import { Wrapper } from 'enkanetwork.js';

// Initialiser la base de données
export const db = new Database('database.sqlite');

// Créer les tables si elles n'existent pas
export const initializeDatabase = () => {

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
            worldLevel INTEGER,
            playerIcon TEXT
        )`)
        .run();

    db.prepare(`
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

/* ======================================================= ADD ======================================================= */

// Ajouter un utilisateur à la base de données (id_discord, uid_genshin)
export function addUser(user: User): boolean {
    try {
        // Obtenir les colonnes et les placeholders
        const columns = Object.keys(user).join(", ");
        const placeholders = Object.keys(user).map(() => "?").join(", ");
        const values = Object.values(user);

        // Construire la requête SQL sécurisée avec des placeholders
        const query = `INSERT INTO users (${columns}) VALUES (${placeholders})`;

        // Exécuter la requête avec les valeurs
        db.prepare(query).run(...values);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Ajouter les informations du compte de l'utilisateur dans la table uid_infos (uid_genshin)
export function addUidInfos(uid_infos: UidInfos): boolean {
    try {
        // Obtenir les colonnes et les placeholders
        const columns = Object.keys(uid_infos).join(", ");
        const placeholders = Object.keys(uid_infos).map(() => "?").join(", ");
        const values = Object.values(uid_infos);

        // Construire la requête SQL sécurisée avec des placeholders
        const query = `INSERT INTO uid_infos (${columns}) VALUES (${placeholders})`;

        // Exécuter la requête avec les valeurs
        db.prepare(query).run(...values);

        return true;
    } catch (error) {
        console.error(`Erreur lors de l'ajout des informations de l'UID ${uid_infos.uid}:`, error);
        return false;
    }
}


// Ajouter un personnages à la base de données (uid_genshin, character_id, name, element, level, stars, assets)
export function addCharacter(character: Character): boolean {
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
        db.prepare(query).run(...values);

        return true;
    } catch (error) {
        console.error(`Erreur lors de l'ajout du personnage ${character.name}:`, error);
        return false;
    }
}

// Créer un profil 
export async function createProfile(uid: string): Promise<boolean> {
    try {
        // Récupérer les informations du joueur
        const { genshin } = new Wrapper();

        const playerData = await genshin.getPlayer(uid);

        // Vérifier si le joueur existe
        if (!playerData) {
            return false;
        }

        // Préparation des variables
        const towerFloor = playerData.player.abyss.floor + "-" + playerData.player.abyss.chamber + "-" + playerData.player.abyss.stars + '⭐';


        // Ajouter les informations de l'utilisateur
        const uid_infos: UidInfos = {
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

        }

        // Ajouter les informations de l'utilisateur
        try {
            addUidInfos(uid_infos);
        }
        catch (error) {
            console.error("Erreur lors de l'ajout des informations de l'UID:", error);
            return false;
        }

        for (const characterData of playerData.player.showcase) {
            const character: Character = {
                uid_genshin: uid,
                character_id: Number(characterData.characterId),
                name: characterData.name,
                element: characterData.element,
                level: Number(characterData.level),
                constellations: characterData.constellations,
                icon: characterData.assets.icon,
            }

            const characterExists = getCharacters(uid).find(c => c.character_id === character.character_id);
            if (characterExists) {
                try {
                    updateCharacter(character);
                } catch (error) {
                    console.error("Erreur lors de la mise à jour du personnage:", error);
                }
            } else {
                try {
                    addCharacter(character);
                } catch (error) {
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
export function userExists(id_discord: string): boolean {
    const user = db.prepare(
        `SELECT * FROM users 
        WHERE id_discord = ?`
    ).get(id_discord);

    if (user === undefined) return false;
    return true;
}

// Vérifier si un utilisateur a cette UID d'enregistré (uid_genshin)
export function userHasUid(uid_genshin: string): boolean {
    const user = db.prepare(
        `SELECT * FROM users 
        WHERE uid_genshin = ?`
    ).get(uid_genshin);

    if (user === undefined) return false;
    return true;
}

/* ======================================================= GET ======================================================= */

// Récupérer les informations d'un utilisateur (id_discord, uid_genshin)
export function getUserUid(id_discord: string): string {
    const uid_genshin = db.prepare(
        `SELECT uid_genshin FROM users 
        WHERE id_discord = ?`
    ).get(id_discord) as { uid_genshin: string };

    return uid_genshin?.uid_genshin || '';
}

// Supprimer un utilisateur de la base de données (id_discord)
export function deleteUser(id_discord: string): void {
    db.prepare(`
        DELETE FROM users
        WHERE id_discord = ?
    `).run(id_discord);
    // console.log("Utilisateur supprimé de la base de données. 😶‍🌫️");
}

// Récupérer les informations d'un utilisateur (uid_genshin)
export function getUidInfos(uid_genshin: string): UidInfos {
    const uid_infos = db.prepare(
        `SELECT * FROM uid_infos 
        WHERE uid = ?`
    ).get(uid_genshin);

    return uid_infos as UidInfos;
}

// Récupérer les personnages d'un utilisateur (uid_genshin)
export function getCharacters(uid_genshin: string) {
    const characters = db.prepare(
        `SELECT * FROM players_characters 
        WHERE uid_genshin = ?`
    ).all(uid_genshin) as { character_id: number, name: string, element: string, level: number, constellations: number }[];
    return characters;
}

/* ======================================================= UPDATE ======================================================= */

// Modifier les informations d'un utilisateur (id_discord, uid_genshin)
export function updateUidUser(user: User): boolean {
    try {
        db.prepare(`
        UPDATE users
        SET uid_genshin = ?
        WHERE id_discord = ?
    `).run(user.uid_genshin, user.id_discord);
        return true;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        return false;
    }
    // console.log("Utilisateur mis à jour dans la base de données. 😶‍🌫️");
}

// Modifier les informations d'un personnage (uid_genshin, character_id, name, element, level, stars, assets)
export function updateCharacter(character: Character): boolean {
    try {
        // Obtenir les colonnes et les placeholders
        const columns = Object.keys(character).join(", ");
        const values = Object.values(character);

        // Construire la requête SQL sécurisée avec des placeholders
        const query = `UPDATE players_characters SET ${columns} WHERE uid_genshin = ? AND character_id = ?`;

        // Exécuter la requête avec les valeurs
        db.prepare(query).run(...values);

        return true;
    } catch (error) {
        console.error(`Erreur lors de la modification du personnage ${character.name}:`, error);
        return false;
    }
}

// Mettre à jour l'ensemble des informations d'un joueur (table UID_infos)
export function updateUidInfos(uid_infos: UidInfos): boolean {
    try {
        // Récupérer les clés (noms des colonnes) et les valeurs
        const columns = Object.keys(uid_infos).filter(key => key !== 'uid');
        const values = Object.values(uid_infos).filter(value => value !== uid_infos.uid);

        // Construire les parties de la requête SQL (colonne = ?)
        const setClause = columns.map(column => `${column} = ?`).join(", ");

        // Ajouter l'UID à la fin de la requête pour la condition WHERE
        const query = `UPDATE uid_infos SET ${setClause} WHERE uid = ?`;

        // Exécuter la requête avec les valeurs
        db.prepare(query).run(...values, uid_infos.uid);

        return true;

    } catch (error) {
        console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
        return false;
    }
}

// Met à jour l'ensemble des informations d'un utilisateur
export async function updateProfile(uid: string): Promise<boolean> {
    try {
        // Récupérer les informations du joueur
        const { genshin } = new Wrapper();

        const playerData = await genshin.getPlayer(uid);

        // Vérifier si le joueur existe
        if (!playerData) {
            return false;
        }

        // Préparation des variables
        const towerFloor = playerData.player.abyss.floor + "-" + playerData.player.abyss.chamber + "-" + playerData.player.abyss.stars + '⭐';


        // Ajouter les informations de l'utilisateur
        const uid_infos: UidInfos = {
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

        }
        // Vérifier si l'utilisateur existe déjà dans la base de données
        if (userHasUid(uid)) {
            try {
                updateUidInfos(uid_infos);
            } catch (error) {
                console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
            }
        }

        // Ajouter le personnage au joueur
        for (const characterData of playerData.player.showcase) {
            const character: Character = {
                uid_genshin: uid,
                character_id: Number(characterData.characterId),
                name: characterData.name,
                element: characterData.element,
                level: Number(characterData.level),
                constellations: characterData.constellations,
                icon: characterData.assets.icon,
            }
            // Vérifier si le personnage existe déjà dans la base de données
            const characterExists = getCharacters(uid).find(c => c.character_id === character.character_id);
            if (characterExists) {
                try {
                    updateCharacter(character);
                } catch (error) {
                    console.error("Erreur lors de la mise à jour du personnage:", error);
                }
            } else {
                try {
                    addCharacter(character);
                } catch (error) {
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


