import { Wrapper } from 'enkanetwork.js';
import { PlayerCharacter, UidInfos } from '../../types';
import { addCharacter, addUidInfos, updateCharacter, updateUidInfos, userHasCharacter, userHasUidInfos } from '../../db';

export const getEnkaData = async (uid: string): Promise<any> => {
    try {
        // Récupérer les informations du joueur
        const { genshin } = new Wrapper();

        const playerData = await genshin.getPlayer(uid);

        return playerData;

    } catch (error) {
        console.error(error);
        return null;
    }
}

export const registerUidInfosEnka = async (data: any): Promise<boolean> => {

    try {

        const towerFloor = data.player.abyss.floor + "-" + data.player.abyss.chamber + "-" + data.player.abyss.stars + '⭐';

        // Ajouter les informations de l'utilisateur
        const uid_infos: UidInfos = {
            uid: data.uid,
            nickname: data.player.username,
            level: Number(data.player.levels.rank),
            signature: data.player.signature,
            finishAchievementNum: data.player.achievements,
            towerFloor: towerFloor,
            affinityCount: data.player.maxFriendshipCount,
            theaterAct: Number(data.player.theaterAct),
            theaterMode: data.player.theaterMode,
            worldLevel: Number(data.player.levels.world),
            playerIcon: data.player.profilePicture.assets.oldIcon,

        }

        const uidInfos = userHasUidInfos(uid_infos.uid);

        if (uidInfos) {
            try {
                updateUidInfos(uid_infos);
                return true;
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour des informations de l'UID:", error);
                return false;
            }

        } else {

            // Ajouter les informations de l'utilisateur
            try {
                addUidInfos(uid_infos);
                return true;
            }
            catch (error) {
                console.error("Erreur lors de l'ajout des informations de l'UID:", error);
                return false;
            }
        }

    } catch (error) {
        console.error("Erreur lors de la mise à jour des informations pour l'utilisateur:", error);
        return false;
    }
}

export const registerCharactersEnka = async (data: any): Promise<boolean> => {

    try {

        for (const characterData of data.player.showcase) {
            const character: PlayerCharacter = {
                uid_genshin: data.uid,
                character_id: Number(characterData.characterId),
                name: characterData.name,
                element: characterData.element,
                level: Number(characterData.level),
                constellations: characterData.constellations,
                icon: characterData.assets.icon,
            }

            const characterExists = userHasCharacter(character.uid_genshin, character.character_id);
            if (characterExists) {
                try {
                    updateCharacter(character);
                } catch (error) {
                    console.error("Erreur lors de la mise à jour du personnage:", error);
                }
            } else {
                try {
                    addCharacter(character);
                } catch (error) {
                    console.error("Erreur lors de l'ajout du personnage:", error);
                }
            }
        }
        return true;

    } catch (error) {
        console.error("Erreur lors de la mise à jour des informations pour l'utilisateur:", error);
        return false;
    }
}