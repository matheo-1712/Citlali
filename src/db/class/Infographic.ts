import { db } from "../db";
import {ApiHandler} from "./ApiHandler";

// Type de la classe
export type InfographicType = {
    character: string,
    build: string,
    url: string,
}

export class Infographic implements InfographicType {
    character: string;
    build: string;
    url: string;

    constructor(character: string, build: string, url: string) {
        this.character = character;
        this.build = build;
        this.url = url;
    }

    toString(): string {
        return `Infographic(character=${this.character}, build=${this.build}, url=${this.url})`;
    }

    // Enregistrer un infographique dans la base de données
    static async add(infographic: InfographicType): Promise<boolean> {
        try {
            const badLink = `https://keqingmains.com/i/${infographic.character.toLowerCase()}/`
            // Vérifier si le lien est bon
            if(infographic.url == badLink) 
            {
                console.log('URL non conforme')
                return false
            }
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
            console.error(error);
            return false;
        }
    }
    
    // Mettre à jour un personnage
    static async update(infographic: Infographic): Promise<boolean> {
        try {
            const badLink = `https://keqingmains.com/i/${infographic.character.toLowerCase()}/`
            // Vérifier si le lien est bon
            if(infographic.url == badLink) 
            {
                console.log('URL non conforme')
                return false
            }

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

    // Supprimer une infographie dans la base de données
    static async delete(infographic: InfographicType): Promise<boolean> {
        try {
            // Obtenir les colonnes et les placeholders
            const values = Object.values(infographic);

            // Construire la requête SQL sécurisée avec des placeholders
            const query = `DELETE FROM infographics WHERE character = ? AND build = ?`;

            // Exécuter la requête avec les valeurs
            db.prepare(query).run(...values, infographic.character, infographic.build);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Vérifier si l'infographie existe
    static async exists(infographic: InfographicType): Promise<boolean> {
        const query = `SELECT * FROM infographics WHERE character = ? AND build = ?`;
        try {
            const result = await db.prepare(query).get(infographic.character, infographic.build);
            return result !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Récupérer tous les infographies dans la base de données
    static async getAll(): Promise<InfographicType[]> {
        try {
            const infographics = db.prepare(
                `SELECT * FROM infographics`
            ).all() as InfographicType[];
            return infographics;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // Fonction spécifique à la classe /---------------------------------------------------------------------------------------------------------/

    // Récupérer les infographies d'un personnage
    static async getCharacterBuilds(id: number): Promise<Infographic[]> {
        try {
            // Récupérer l'URL de l'API
            const url = await ApiHandler.getApiLink("infographics-getByIdGenshinCharacter");
            if (!url) return [];

            // Appel à l'API
            const response = await fetch(`${url.route}${id}`);
            const json = await response.json();

            // Vérification et extraction des données
            if (!json.success || !Array.isArray(json.data)) {
                console.warn("Réponse inattendue :", json);
                return [];
            }

            // Retourne les personnages extraits
            return json.data as Infographic[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}