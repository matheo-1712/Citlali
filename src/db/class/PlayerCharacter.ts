import { db } from "../db";

export type PlayerCharacterType = {
    uid_genshin: string,
    character_id: number,
    name: string,
    element: string,
    level: number,
    constellations: number,
    icon: string,
}

export class PlayerCharacter implements PlayerCharacterType {
    uid_genshin: string;
    character_id: number;
    name: string;
    element: string;
    level: number;
    constellations: number;
    icon: string;

    constructor(uid_genshin: string, character_id: number, name: string, element: string, level: number, constellations: number, icon: string) {
        this.uid_genshin = uid_genshin;
        this.character_id = character_id;
        this.name = name;
        this.element = element;
        this.level = level;
        this.constellations = constellations;
        this.icon = icon;
    }

    toString(): string {
        return `PlayerCharacter(uid_genshin=${this.uid_genshin}, character_id=${this.character_id}, name=${this.name}, element=${this.element}, level=${this.level}, constellations=${this.constellations}, icon=${this.icon})`;
    }

    // Enregistrer un personnage dans la base de données
    static async add(character: PlayerCharacterType): Promise<boolean> {
        try {
            // Obtenir les colonnes et les placeholders
            const columns = Object.keys(character).join(", ");
            const placeholders = Object.keys(character).map(() => "?").join(", ");
            const values = Object.values(character);

            // Construire la requête SQL sécurisée avec des placeholders
            const query = `INSERT INTO players_characters (${columns}) VALUES (${placeholders})`;

            // Exécuter la requête avec les valeurs
            db.prepare(query).run(...values);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Mettre à jour un personnage
    static async update(character: PlayerCharacterType): Promise<boolean> {
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

    // Supprimer un personnage
    static async delete(character: PlayerCharacterType): Promise<boolean> {
        try {
            // Obtenir les colonnes et les placeholders
            const values = Object.values(character);

            // Construire la requête SQL sécurisée avec des placeholders
            const query = `DELETE FROM players_characters WHERE uid_genshin = ? AND character_id = ?`;

            // Exécuter la requête avec les valeurs
            db.prepare(query).run(...values, character.uid_genshin, character.character_id);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Vérifier si un personnage existe dans la base de données (uid_genshin, character_id)
    static async exists(uid_genshin: string, character_id: number): Promise<boolean> {
        try {
            const result = db.prepare(
                `SELECT * FROM players_characters 
                WHERE uid_genshin = ? AND character_id = ?`
            ).get(uid_genshin, character_id);

            // Si l'utilisateur existe, on renvoie true, sinon false
            return result !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Récupérer tous les personnages
    static async getAll(): Promise<PlayerCharacterType[]> {
        try {
            const characters = db.prepare(
                `SELECT * FROM players_characters`
            ).all() as { uid_genshin: string, character_id: number, name: string, element: string, level: number, constellations: number, icon: string }[];
            return characters;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // Fonction spécifique à la classe /---------------------------------------------------------------------------------------------------------/

    // Récupérer l'UID Genshin d'un membre dans la base de données
    static getUID(id_discord: string): string {
        try {
            const result = db.prepare(
                `SELECT uid_genshin FROM users 
            WHERE id_discord = ?`
            ).get(id_discord) as { uid_genshin: string };

            return result?.uid_genshin || '';
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    // Récupérer les personnages d'un membre dans la base de données
    static getPlayerCharacters(uid_genshin: string): PlayerCharacter[] {
        try {
            const characters = db.prepare(
                `SELECT * FROM players_characters 
                WHERE uid_genshin = ?`
            ).all(uid_genshin) as { character_id: number, name: string, element: string, level: number, constellations: number, icon: string, uid_genshin: string }[];
            return characters;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // Récupérer le personnage d'un membre dans la base de données
    static getPlayerCharacter(uid_genshin: string, character_id: number): PlayerCharacterType {
        try {
            const result = db.prepare(
                `SELECT * FROM players_characters 
                WHERE uid_genshin = ? AND character_id = ?`
            ).get(uid_genshin, character_id) as { uid_genshin: string, character_id: number, name: string, element: string, level: number, constellations: number, icon: string };

            return result as PlayerCharacterType;
        } catch (error) {
            console.error(error);
            return {
                uid_genshin: '',
                character_id: 0,
                name: '',
                element: '',
                level: 0,
                constellations: 0,
                icon: ''
            } as PlayerCharacterType;
        }
    }
}