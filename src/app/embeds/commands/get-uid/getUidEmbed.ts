import {ColorResolvable, EmbedBuilder} from "discord.js";
import {UidInfosType} from "../../../types/UidInfosType";

/**
 * Creates and returns an embed message object with information about a user's UID, formatted for use in applications like Discord.'
 * @param uid_infos
 */
export async function getUidEmbed(uid_infos: UidInfosType | undefined) {
    let carnageEmote = ""
    // Préparation de variable
    if (uid_infos) {

        // Texte du niveau du théâtre
        switch (uid_infos.theaterMode) {
            case "64":
                uid_infos.theaterMode = "Lunaire";
                break;
            case "61":
                uid_infos.theaterMode = "Visionnaire";
                break;
            default:
                uid_infos.theaterMode = "Non défini";
                break;
        }

        // Emoji du carnage
        switch (uid_infos.stygianIndex) {
            case 1:
                carnageEmote = "<:carnage1:1432735537503928360>"
                break;
            case 2:
                carnageEmote = "<:carnage2:1432736235754881064>"
                break;
            case 3:
                carnageEmote = "<:carnage3:1432736587355263007>"
                break;
            case 4:
                carnageEmote = "<:carnage4:1432736604069429470>"
                break;
            case 5:
                carnageEmote = "<:carnage5:1432736616266465392>"
                break;
            case 6:
                if (uid_infos.stygianSeconds > 150) {
                    carnageEmote = "<:carnage62:1432736647308644382>"
                    break;
                }
                carnageEmote = "<:carnage6:1432736630174650462>"
                break;
            default:
                carnageEmote = ""
                break;
        }
    }

    const theatreEmbed = `Théâtre: Acte ${uid_infos?.theaterAct || 0} • ${uid_infos?.theaterMode || 'Non défini'}`
    const carnageEmbed = `Carnage: ${uid_infos?.stygianIndex || 0} ${carnageEmote} - ${uid_infos?.stygianSeconds || 0}s`

    return new EmbedBuilder()
        .setTitle(`Profil de ${uid_infos?.nickname || 'Utilisateur inconnu'}`)
        .setURL(`https://akasha.cv/profile/${uid_infos?.uid}`)
        .addFields(
            {name: `Informations`, value: ``, inline: false},

            // Ligne 1 : infos générales
            {name: `Pseudo`, value: `${uid_infos?.nickname || 'Utilisateur inconnu'}`, inline: true},
            {name: `UID`, value: `${uid_infos?.uid || 'Non défini'}`, inline: true},
            {name: `Niveau`, value: `Lv. ${uid_infos?.level || 0}`, inline: true},

            // Ligne 2 : monde et succès
            {name: `Monde`, value: `Niveau ${uid_infos?.worldLevel || 0}`, inline: true},
            {name: `Succès`, value: `${uid_infos?.finishAchievementNum || 0}`, inline: true},
            {name: `Affinités`, value: `${uid_infos?.affinityCount || 0} personnages`, inline: true},

            // Ligne 3 : progression large (Abysse, Théâtre, Carnage)
            {
                name: `Progression`,
                value: `Abysse: ${uid_infos?.towerFloor || 'Non défini'}`
                    + "\n" + theatreEmbed + "\n" +
                    carnageEmbed,
                inline: false
            },

            // Ligne 4 : signature
            {name: `Signature`, value: `${uid_infos?.signature || 'Aucune'}`, inline: false}
        )
        .setThumbnail(`https://enka.network/ui/${uid_infos?.playerIcon || '0'}.png`)
        .setColor("#00b0f4")
        .setFooter({
            text: "Powered by EnkaNetwork API",
        })
        .setTimestamp();
}

export function getUidEmbedError(title: string, color: ColorResolvable) {
    return new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setFooter({
            text: "Citlali - Powered by Citlapi",
        })
        .setTimestamp();
}