import { db } from "../db";
import axios from "axios";
import {ApiHandler, ApiLink} from "./ApiHandler";

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
            // Récupérer le lien
            const url : ApiLink | null = await ApiHandler.getApiLink("id-discord-to-uid-create");

            // Vérifier si le lien est bon
            if (url === null) return false;

            // Appel à l'API
            const result = await axios.post(`${url.route}`, {
                id_discord: user.id_discord,
                uid_genshin: user.uid_genshin
            }, {
                headers: {'Authorization': `${process.env.API_TOKEN}`}
            }).catch(error => {
                console.error(error);
                return false;
            })
            // Si la création a fonctionné, on renvoie true, sinon false
            return result !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Vérifier si un utilisateur existe dans la base de données (id_discord)
    static async exists(object: string): Promise<boolean> {
        try {
            // Récupérer le lien
            const url: ApiLink | null = await ApiHandler.getApiLink("id-discord-to-uid-getByUid");
            // Vérifier si le lien est bon
            if (url === null) return false;

            // Appel à l'API
            const response = await axios.get(`${url.route}${object}`);
            const result = response.data;
            // Si l'utilisateur existe et a des données, on renvoie true, sinon false
            return result && result.data !== null;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

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

    static async uidExists(uid: string): Promise<boolean> {
        try {
            const url: ApiLink | null = await ApiHandler.getApiLink("id-discord-to-uid-getUidByUid");

            // Vérifier si le lien n'est pas bon
            if (url === null) return false;

            const response = await axios.get(`${url.route}${uid}`);
            const result = response.data;
            // Si l'utilisateur existe et a des données, on renvoie true, sinon false
            return result && result.data !== null;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
