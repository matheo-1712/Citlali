import { db } from "../db";

export type CharacterType = {
    name: string,
    weapon: string,
    vision: string,
    region: string,
    portraitLink: string,
    value: string,
}

export class Character implements CharacterType {
    name: string;
    weapon: string;
    vision: string;
    region: string;
    portraitLink: string;
    value: string;

    constructor(name: string, weapon: string, vision: string, region: string, portraitLink: string, value: string) {
        this.name = name;
        this.weapon = weapon;
        this.vision = vision;
        this.region = region;
        this.portraitLink = portraitLink;
        this.value = value;
    }

    toString(): string {
        return `Character (name: ${this.name}, weapon: ${this.weapon}, vision: ${this.vision}, region: ${this.region}, portraitLink: ${this.portraitLink}, value: ${this.value})`;
    }

    // Ajouter un personnage à la base de données
    static async add(character: Character): Promise<boolean> {
        try {
            // Obtenir les colonnes et les placeholders
            const columns = Object.keys(character).join(", ");
            const placeholders = Object.keys(character).map(() => "?").join(", ");
            const values = Object.values(character);

            // Construire la requête SQL sécurisée avec des placeholders
            const query = `INSERT INTO characters (${columns}) VALUES (${placeholders})`;

            // Exécuter la requête avec les valeurs
            db.prepare(query).run(...values);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }

    }

    // Mettre à jour un personnage
    static async update(character: Character): Promise<boolean> {
        try {
            // Obtenir les colonnes et leurs placeholders pour la mise à jour
            const columns = Object.keys(character)
                // Exclure les conditions de la requête
                .map(key => `${key} = ?`)
                .join(", ");
    
            // Vérifier si des colonnes existent pour la mise à jour
            if (!columns) {
                throw new Error("Aucune donnée valide à mettre à jour.");
            }
    
            // Préparer les valeurs pour les colonnes à mettre à jour
            const values = Object.keys(character)
                .filter(key => key !== 'uid_genshin' && key !== 'character_id')
                .map(key => character[key as keyof Character]);
    
            // Construire la requête SQL sécurisée
            const query = `UPDATE players_characters SET ${columns} WHERE value = ?`;
    
            // Exécuter la requête avec les valeurs
            db.prepare(query).run(...values);
    
            return true;
        } catch (error) {
            console.error(`Erreur lors de la modification du personnage ${character.name}:`, error);
            return false;
        }
    }

    // Supprimer un personnage
    static async delete(character: Character): Promise<boolean> {
        try {
            // Obtenir les colonnes et les placeholders
            const values = Object.values(character);

            // Construire la requête SQL sécurisée avec des placeholders
            const query = `DELETE FROM characters WHERE value = ?`;

            // Exécuter la requête avec les valeurs
            db.prepare(query).run(...values, character.value);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Vérifier si un personnage existe
    static async exists(character: Character): Promise<boolean> {
        try {
            const result = db.prepare(
                `SELECT * FROM characters 
                WHERE value = ?`
            ).get(character.value);

            return result !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Récupérer tous les personnages
    static async getAll(): Promise<Character[]> {
        try {
            const characters = db.prepare(
                `SELECT * FROM characters`
            ).all() as { name: string, weapon: string, vision: string, region: string, portraitLink: string, value: string }[];
            return characters;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // Récupérer un personnage
    static async getCharacterInfos(value: string): Promise<Character> {
        try {
            const character = db.prepare(
                `SELECT * FROM characters 
                WHERE value = ?`
            ).get(value);

            return character as Character;
        } catch (error) {
            console.error(error);
            return {
                name: '',
                weapon: '',
                vision: '',
                region: '',
                portraitLink: '',
                value: ''
            } as Character;
        }
    }

} 