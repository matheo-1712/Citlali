import Database from 'better-sqlite3';
import { dirname } from 'path';
import { Character } from './class/Character';

// Initialiser la base de données
export const db = new Database('database.sqlite');

// Créer les tables si elles n'existent pas
export const initializeDatabase = () => {

    // Création de la table users
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
};

