import {EmbedBuilder} from "discord.js";
import {UidInfosType} from "../types/UidInfosType";

/**
 * Creates and returns an embed message object with information about a user's UID, formatted for use in applications like Discord.'
 * @param uid_infos
 */
export async function getUidEmbed(uid_infos: UidInfosType | undefined) {
    return new EmbedBuilder()
        .setTitle(`Profil de ${uid_infos?.nickname || 'Utilisateur inconnu'}`)
        .setURL(`https://akasha.cv/profile/${uid_infos?.uid}`)
        .addFields(
            {name: `Informations`, value: ``, inline: false},
            {name: `Pseudo`, value: `${uid_infos?.nickname || 'Utilisateur inconnu'}`, inline: true},
            {name: `UID`, value: `${uid_infos?.uid || 'Non défini'}`, inline: true},
            {name: `Niveau`, value: `Lv. ${uid_infos?.level || 0}`, inline: true},
            {name: `Monde`, value: `Niveau ${uid_infos?.worldLevel || 0}`, inline: true},
            {name: `Succès`, value: `${uid_infos?.finishAchievementNum || 0}`, inline: true},
            {name: `Abysse`, value: `${uid_infos?.towerFloor || 'Non défini'}`, inline: true},
            {name: `Affinités`, value: `${uid_infos?.affinityCount || 0}`, inline: true},
            {
                name: `Théâtre`,
                value: `Acte ${uid_infos?.theaterAct || 0} • ${uid_infos?.theaterMode || 'Non défini'}`,
                inline: true
            },
            {name: `Signature`, value: `${uid_infos?.signature || 'Aucune'}`, inline: false},
        )
        .setThumbnail(`https://enka.network/ui/${uid_infos?.playerIcon || '0'}.png`)
        .setColor("#00b0f4")
        .setFooter({
            text: "Powered by EnkaNetwork API",
        })
        .setTimestamp();
}