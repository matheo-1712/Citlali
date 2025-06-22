import {ApiHandler, ApiLink} from "./ApiHandler";
import axios from "axios";

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

    // Récupérer tous les informations d'un utilisateur

    static async getPlayerUidInfos(uid: string): Promise<UidInfosType> {
        try {
            const url: ApiLink | null = await ApiHandler.getApiLink("uid-infos-getByUid");

            // Vérifier si le lien n'est pas bon
            if (url === null) return {
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

            console.log(`${url.route}/${uid}`);
            const response = await axios.get(`${url.route}/${uid}`);
            const result = response.data;

            // ⚠️ On retourne uniquement les données utiles
            return result.data as UidInfosType;

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

    static async refresh(uid_genshin: string | null): Promise<boolean> {
        try {
            const url: ApiLink | null = await ApiHandler.getApiLink("uid-infos-refresh");

            // Vérifier si le lien n'est pas bon
            if (url === null) return false;

            // Appel à l'API
            const result = await axios.post(`${url.route}`, {
                uid_genshin: uid_genshin
            }, {
                headers: {'Authorization': `${process.env.API_TOKEN}`}
            }).catch(error => {
                console.error(error);
                return false;
            })

            // Si la création a fonctionné, on renvoie true, sinon false
            return result !== undefined
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}