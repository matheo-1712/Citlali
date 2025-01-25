import { db } from "../db";

export type UidInfosType = {
    uid: string,
    nickname: string,
    level: number,
    worldLevel: number,
    signature: string,
    finishAchievementNum: number,
    towerFloor: string,
    affinityCount: number,
    theaterAct: number,
    theaterMode: string,
    playerIcon: string,
}


export class UidInfos implements UidInfosType {
    uid: string;
    nickname: string;
    level: number;
    worldLevel: number;
    signature: string;
    finishAchievementNum: number;
    towerFloor: string;
    affinityCount: number;
    theaterAct: number;
    theaterMode: string;
    playerIcon: string;

    constructor(uid: string, nickname: string, level: number, worldLevel: number, signature: string, finishAchievementNum: number, towerFloor: string, affinityCount: number, theaterAct: number, theaterMode: string, playerIcon: string) {
        this.uid = uid;
        this.nickname = nickname;
        this.level = level;
        this.worldLevel = worldLevel;
        this.signature = signature;
        this.finishAchievementNum = finishAchievementNum;
        this.towerFloor = towerFloor;
        this.affinityCount = affinityCount;
        this.theaterAct = theaterAct;
        this.theaterMode = theaterMode;
        this.playerIcon = playerIcon;

    }

    toString(): string {
        return `UidInfos(uid=${this.uid}, nickname=${this.nickname}, level=${this.level}, worldLevel=${this.worldLevel}, signature=${this.signature}, finishAchievementNum=${this.finishAchievementNum}, towerFloor=${this.towerFloor}, affinityCount=${this.affinityCount}, theaterAct=${this.theaterAct}, theaterMode=${this.theaterMode}, playerIcon=${this.playerIcon})`;
    }

    // Enregistrer un utilisateur dans la base de données
    static async add(uid_infos: UidInfosType): Promise<boolean> {
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
            console.error(error);
            return false;
        }
    }

    // Mettre à jour un utilisateur dans la base de données
    static async update(uid_infos: UidInfosType): Promise<boolean> {
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

    // Supprimer un utilisateur dans la base de données
    static async delete(uid_infos: UidInfosType): Promise<boolean> {
        try {
            // Obtenir les colonnes et les placeholders
            const values = Object.values(uid_infos);

            // Construire la requête SQL sécurisée avec des placeholders
            const query = `DELETE FROM uid_infos WHERE uid = ?`;

            // Exécuter la requête avec les valeurs
            db.prepare(query).run(...values, uid_infos.uid);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Vérifier si un utilisateur existe dans la base de données (id_discord)
    static async exists(uid: string): Promise<boolean> {
        try {
            const result = db.prepare(
                `SELECT uid FROM uid_infos 
                WHERE uid = ?`
            ).get(uid) as { uid: string };

            // Si l'utilisateur existe, on renvoie true, sinon false
            return result !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Fonction spécifique à la classe /---------------------------------------------------------------------------------------------------------/

    // Récupérer tous les informations d'un utilisateur

    static async getPlayerUidInfos(uid: string): Promise<UidInfosType> {
        try {
            const result = db.prepare(
                `SELECT * FROM uid_infos 
                WHERE uid = ?`
            ).get(uid) as { uid: string, nickname: string, level: number, worldLevel: number, signature: string, finishAchievementNum: number, towerFloor: string, affinityCount: number, theaterAct: number, theaterMode: string, playerIcon: string };

            return result as UidInfosType;
        } catch (error) {
            console.error(error);
            return {
                uid: '',
                nickname: '',
                level: 0,
                worldLevel: 0,
                signature: '',
                finishAchievementNum: 0,
                towerFloor: '',
                affinityCount: 0,
                theaterAct: 0,
                theaterMode: '',
                playerIcon: ''
            } as UidInfosType;
        }
    }
}