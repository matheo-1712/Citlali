"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCharactersEnka = exports.registerUidInfosEnka = exports.getEnkaData = void 0;
const enkanetwork_js_1 = require("enkanetwork.js");
const db_1 = require("../../db");
const getEnkaData = async (uid) => {
    try {
        // Récupérer les informations du joueur
        const { genshin } = new enkanetwork_js_1.Wrapper();
        const playerData = await genshin.getPlayer(uid);
        return playerData;
    }
    catch (error) {
        console.error(error);
        return null;
    }
};
exports.getEnkaData = getEnkaData;
const registerUidInfosEnka = async (data) => {
    try {
        const towerFloor = data.player.abyss.floor + "-" + data.player.abyss.chamber + "-" + data.player.abyss.stars + '⭐';
        // Ajouter les informations de l'utilisateur
        const uid_infos = {
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
        };
        const uidInfos = (0, db_1.userHasUidInfos)(uid_infos.uid);
        if (uidInfos) {
            try {
                (0, db_1.updateUidInfos)(uid_infos);
                return true;
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour des informations de l'UID:", error);
                return false;
            }
        }
        else {
            // Ajouter les informations de l'utilisateur
            try {
                (0, db_1.addUidInfos)(uid_infos);
                return true;
            }
            catch (error) {
                console.error("Erreur lors de l'ajout des informations de l'UID:", error);
                return false;
            }
        }
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour des informations pour l'utilisateur:", error);
        return false;
    }
};
exports.registerUidInfosEnka = registerUidInfosEnka;
const registerCharactersEnka = async (data) => {
    try {
        for (const characterData of data.player.showcase) {
            const character = {
                uid_genshin: data.uid,
                character_id: Number(characterData.characterId),
                name: characterData.name,
                element: characterData.element,
                level: Number(characterData.level),
                constellations: characterData.constellations,
                icon: characterData.assets.icon,
            };
            const characterExists = (0, db_1.userHasCharacter)(character.uid_genshin, character.character_id);
            if (characterExists) {
                try {
                    (0, db_1.updateCharacter)(character);
                }
                catch (error) {
                    console.error("Erreur lors de la mise à jour du personnage:", error);
                }
            }
            else {
                try {
                    (0, db_1.addCharacter)(character);
                }
                catch (error) {
                    console.error("Erreur lors de l'ajout du personnage:", error);
                }
            }
        }
        return true;
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour des informations pour l'utilisateur:", error);
        return false;
    }
};
exports.registerCharactersEnka = registerCharactersEnka;
