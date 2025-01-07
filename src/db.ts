import Database from 'better-sqlite3';
import { Character, UidInfos, User } from './types';

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
            worldLevel INTEGER
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
export function addCharacter(character: Character) : boolean {
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

// Modifier les informations d'un utilisateur (id_discord, uid_genshin)
export function updateUidUser(user: User) {
    db.prepare(`
        UPDATE users
        SET uid_genshin = ?
        WHERE id_discord = ?
    `).run(user.uid_genshin, user.id_discord);
    console.log("Utilisateur mis à jour dans la base de données. 😶‍🌫️");
}

// Modifier les informations d'un personnage (uid_genshin, character_id, name, element, level, stars, assets)
export function updateCharacter(character: Character) {
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

// Récupérer les informations d'un utilisateur (id_discord, uid_genshin)
export function getUserUid(id_discord: string): string {
    const uid_genshin = db.prepare(
        `SELECT uid_genshin FROM users 
        WHERE id_discord = ?`
    ).get(id_discord) as { uid_genshin: string };

    return uid_genshin?.uid_genshin || '';
}

// Supprimer un utilisateur de la base de données (id_discord)
export function deleteUser(id_discord: string) {
    db.prepare(`
        DELETE FROM users
        WHERE id_discord = ?
    `).run(id_discord);
    console.log("Utilisateur supprimé de la base de données. 😶‍🌫️");
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


