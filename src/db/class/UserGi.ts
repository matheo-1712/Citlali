import { db } from "../db";

// Type de la classe 
export type UserType = {
    id_discord: string,
    uid_genshin: string | null;
}

export class UserGi implements UserType {
    id_discord: string;
    uid_genshin: string | null;

    constructor(id_discord: string, uid_genshin: string | null) {
        this.id_discord = id_discord;
        this.uid_genshin = uid_genshin;
    }

    toString(): string {
        return `User(id_discord=${this.id_discord}, uid_genshin=${this.uid_genshin})`;
    }

    // Enregistrer un utilisateur dans la base de données
    static async add(user: UserType): Promise<boolean> {
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

    // Mettre à jour un utilisateur dans la base de données
    static async update(object: UserType): Promise<boolean> {
        try {
            // Obtenir les colonnes et les placeholders
            const columns = Object.keys(object).join(", ");
            const values = Object.values(object);

            // Construire la requête SQL sécurisée avec des placeholders
            const query = `UPDATE users SET ${columns} WHERE id_discord = ?`;

            // Exécuter la requête avec les valeurs
            db.prepare(query).run(...values, object.id_discord);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Supprimer un utilisateur dans la base de données
    static async delete(object: UserType): Promise<boolean> {
        try {
            // Obtenir les colonnes et les placeholders
            const values = Object.values(object);

            // Construire la requête SQL sécurisée avec des placeholders
            const query = `DELETE FROM users WHERE id_discord = ?`;

            // Exécuter la requête avec les valeurs
            db.prepare(query).run(...values, object.id_discord);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Vérifier si un utilisateur existe dans la base de données (id_discord)
    static async exists(object: string): Promise<boolean> {
        try {
            const result = db.prepare(
                `SELECT id_discord FROM users 
                WHERE id_discord = ?`
            ).get(object) as { id_discord: string };

            // Si l'utilisateur existe, on renvoie true, sinon false
            return result !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Récupérer tous les utilisateurs dans la base de données
    static async getAll(): Promise<UserType[]> {
        try {
            const users = db.prepare(
                `SELECT * FROM users`
            ).all() as { id_discord: string, uid_genshin: string | null }[];
            return users;
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

    // Vérifier si l'UID est déjà enregistré dans la base de données
    static async uidExists(uid: string): Promise<boolean> {
        try {
            const result = db.prepare(
                `SELECT uid_genshin FROM users 
                    WHERE uid_genshin = ?`
            ).get(uid) as { uid_genshin: string };

            // Si l'utilisateur existe, on renvoie true, sinon false
            return result !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
