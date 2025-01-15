import Database from 'better-sqlite3';
import { Character, Infographic, PlayerCharacter, UidInfos, User } from './types';
import { dirname } from 'path';

// Initialiser la base de données
export const db = new Database('database.sqlite');

// Créer les tables si elles n'existent pas
export const initializeDatabase = () => {

    // Création de la table users
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            id_discord TEXT NOT NULL,
            uid_genshin TEXT NOT NULL
        )`)
        .run();

    // Création de la table uid_infos
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

    // Création de la table players_characters
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

    // Création de la table characters
    db.prepare(`
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
    db.prepare(`
            CREATE TABLE IF NOT EXISTS infographics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                character TEXT NOT NULL,
                build TEXT NOT NULL,
                url TEXT NOT NULL
            )
        `).run();


    // Récupérer les données des personnages depuis le fichier characters.json
    const characters = require(`${dirname(__dirname)}/characters.json`).characters;

    // Ajouter les données des personnages dans la table characters seulement si elles n'existent pas déjà
    characters.forEach((character: Character) => {
        const characterExists = db.prepare(`
                SELECT * FROM characters
                WHERE name = ?
            `).get(character.name);

        if (!characterExists) {
            db.prepare(`
                    INSERT INTO characters (name, weapon, vision, region, portraitLink, value)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(character.name, character.weapon, character.vision, character.region, character.portraitLink, character.value);
        }
    });
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
export function addCharacter(character: PlayerCharacter): boolean {
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
        db.prepare(query).run(...values);

        return true;
    } catch (error) {
        console.error(`Erreur lors de l'ajout du personnage ${character.name}:`, error);
        return false;
    }
}

// Ajouter un infographie à la base de données (character, build, url)
export function addInfographic(infographic: Infographic): boolean {
    try {
        // Obtenir les colonnes et les placeholders
        const columns = Object.keys(infographic).join(", ");
        const placeholders = Object.keys(infographic).map(() => "?").join(", ");
        const values = Object.values(infographic);

        // Construire la requête SQL sécurisée avec des placeholders
        const query = `INSERT INTO infographics (${columns}) VALUES (${placeholders})`;

        // Exécuter la requête avec les valeurs
        db.prepare(query).run(...values);

        return true;
    } catch (error) {
        console.error(`Erreur lors de l'ajout de l'infographie ${infographic.character}:`, error);
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

// Vérifier si l'utilisateur a déjà les informations d'un UID enregistré
export function userHasUidInfos(uid_genshin: string): boolean {
    const user = db.prepare(
        `SELECT * FROM uid_infos 
        WHERE uid = ?`
    ).get(uid_genshin);

    if (user === undefined) return false;
    return true;
}

// Vérifier si l'utilisateur a déjà ce personnage enregistré
export function userHasCharacter(uid_genshin: string, character_id: number): boolean {
    const user = db.prepare(
        `SELECT * FROM players_characters 
        WHERE uid_genshin = ? AND character_id = ?`
    ).get(uid_genshin, character_id);

    if (user === undefined) return false;
    return true;
}

// Vérifier si l'infographie existe dans la base de données (character, build)
export function characterHasInfographic(character: string, build: string): boolean {
    const user = db.prepare(
        `SELECT * FROM infographics 
        WHERE character = ? AND build = ?`
    ).get(character, build);

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

// Récupérer les informations d'un utilisateur (uid_genshin)
export function getUidInfos(uid_genshin: string): UidInfos {
    const uid_infos = db.prepare(
        `SELECT * FROM uid_infos 
        WHERE uid = ?`
    ).get(uid_genshin);

    return uid_infos as UidInfos;
}

// Récupérer les personnages d'un utilisateur (uid_genshin)
export function getPlayerCharacters(uid_genshin: string) {
    const characters = db.prepare(
        `SELECT * FROM players_characters 
        WHERE uid_genshin = ?`
    ).all(uid_genshin) as { character_id: number, name: string, element: string, level: number, constellations: number }[];
    return characters;
}

// Récupérer la liste des personnages 
export function getCharactersList(): Character[] {
    const characters = db.prepare(
        `SELECT * FROM characters`
    ).all() as { name: string, weapon: string, vision: string, region: string, portraitLink: string, value: string }[];
    return characters;
}

export function getCharacterInfos(value: string): Character {
    const character = db.prepare(
        `SELECT * FROM characters 
        WHERE value = ?`
    ).get(value);

    return character as Character;
}

export function getCharacterBuilds(name: string): Infographic[] {
    const builds = db.prepare(
        `SELECT * FROM infographics 
        WHERE character = ?`
    ).all(name) as Infographic[];

    return builds;
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

export function updateCharacter(character: PlayerCharacter): boolean {
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
            .map(key => character[key as keyof PlayerCharacter]);

        // Ajouter les valeurs des conditions à la fin (uid_genshin et character_id)
        values.push(character.uid_genshin, character.character_id);

        // Construire la requête SQL sécurisée
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

export function updateInfographic(infographic: Infographic): boolean {
    try {
        // Obtenir les colonnes et les placeholders pour la mise à jour
        const columns = Object.keys(infographic).filter(key => key !== 'character' && key !== 'build');
        const values = Object.values(infographic).filter(value => value !== infographic.character && value !== infographic.build);

        // Construire les parties de la requête SQL (colonne = ?)
        const setClause = columns.map(column => `${column} = ?`).join(", ");

        // Ajouter l'UID à la fin de la requête pour la condition WHERE
        const query = `UPDATE infographics SET ${setClause} WHERE character = ? AND build = ?`;

        // Exécuter la requête avec les valeurs
        db.prepare(query).run(...values, infographic.character, infographic.build);

        return true;

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'infographie:", error);
        return false;
    }
}
