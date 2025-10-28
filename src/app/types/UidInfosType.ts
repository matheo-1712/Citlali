/**
 * Represents a user's Genshin Impact account information, including general profile details and progress indicators.
 * @typedef {Object} UidInfosType
 * @property {string} uid - The unique identifier of the player's account.
 * @property {string} nickname - The in-game nickname chosen by the player.
 * @property {number} level - The current Adventure Rank level of the player.
 * @property {number} worldLevel - The current world level of the player's account.
 * @property {string} signature - The personal signature or status message set by the player.
 * @property {number} finishAchievementNum - The total number of achievements completed by the player.
 * @property {string} towerFloor - The highest floor reached in the Spiral Abyss.
 * @property {number} affinityCount - The total number of characters with max friendship level.
 * @property {number} theaterAct - The current act reached in the Imaginarium Theater.
 * @property {string} theaterMode - The current mode or difficulty of the Imaginarium Theater.
 * @property {string} playerIcon - The URL or identifier of the player's profile icon.
 */
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
    playerIcon?: string,
    stygianIndex: number
    stygianSeconds: number
};
