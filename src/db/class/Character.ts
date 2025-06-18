import {db} from "../db";
import {ApiHandler} from "./ApiHandler";

export type CharacterType = {
    id?: number,
    name: string,
    weapon: string,
    element: string,
    region: string,
    portraitLink: string,
    formatedValue: string,
}

export class Character implements CharacterType {
    id?: number;
    name: string;
    weapon: string;
    element: string;
    region: string;
    portraitLink: string;
    formatedValue: string;

    constructor(name: string, weapon: string, element: string, region: string, portraitLink: string, formatedValue: string) {
        this.name = name;
        this.weapon = weapon;
        this.element = element;
        this.region = region;
        this.portraitLink = portraitLink;
        this.formatedValue = formatedValue;
    }

    toString(): string {
        return `Character (name: ${this.name}, weapon: ${this.weapon}, vision: ${this.element}, region: ${this.region}, portraitLink: ${this.portraitLink}, value: ${this.formatedValue})`;
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
            db.prepare(query).run(...values, character.formatedValue);

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
            ).get(character.formatedValue);

            return result !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Récupérer tous les personnages
    static async getAll(): Promise<Character[]> {
        try {
            // Récupérer l'URL de l'API
            const url = await ApiHandler.getApiLink("characters-getAll");
            if (!url) return [];

            // Appel à l'API
            const response = await fetch(url.route);
            const json = await response.json();

            // Vérification et extraction des données
            if (!json.success || !Array.isArray(json.data)) {
                console.warn("Réponse inattendue :", json);
                return [];
            }

            // Retourne les personnages extraits
            return json.data as Character[];
        } catch (error) {
            console.error("Erreur lors de la récupération des personnages :", error);
            return [];
        }
    }

    // Récupérer un personnage
    static async getCharacterInfos(value: string): Promise<Character | null> {
        try {
            // Récupérer l'URL de l'API
            const url = await ApiHandler.getApiLink("characters-getByValue");
            if (!url) return null;

            // Appel à l'API
            const response = await fetch(`${url.route}${value}`);

            const json = await response.json();

            // Vérification et extraction des données
            if (!json.success || !json.data) {
                console.warn("Réponse inattendue :", json);
                return null;
            }

            // Retourne les informations du personnage
            return json.data as Character;

        } catch (error) {
            console.error(error);
            return null;
        }
    }
} 