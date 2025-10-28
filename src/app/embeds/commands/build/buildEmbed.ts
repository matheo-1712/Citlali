import {ColorResolvable, EmbedBuilder} from "discord.js";
import {CharacterInfosType} from "../../../types/CharacterInfos";
import {InfographicType} from "../../../types/Infographic";
import {getGuideLink} from "../../../utils/guideLink";

/**
 * Builds an embedded message containing information about a character, including their name, vision, weapon, and an optional build infographic.
 *
 * @param {CharacterInfosType} characterInfos - Information about the character, such as name, element (vision), region, and portrait link.
 * @param {{ url: string }[]} [characterBuilds=[]] - Array of objects containing URLs for character builds; uses a default image if none is provided.
 * @return {Promise<EmbedBuilder>} A promise that resolves to an EmbedBuilder instance populated with the character's build information.
 */
export async function buildEmbed(characterInfos: CharacterInfosType, characterBuilds?: InfographicType[] | undefined): Promise<EmbedBuilder> {
    // Déclaration des variables
    let embedColor: ColorResolvable;
    let elementEmote: string;
    let weaponTranslation: string;
    let weaponEmote: string;

    // Gestion de l'arme
    switch (characterInfos.weapon) {
        case "Sword":
            weaponTranslation = "Épée";
            weaponEmote = "<:icon_sword:1328118474588815401>";
            break;
        case "Claymore":
            weaponTranslation = "Claymore";
            weaponEmote = "<:icon_claymore:1328118750733537302>";
            break;
        case "Polearm":
            weaponTranslation = "Lance";
            weaponEmote = "<:icon_lance:1328117598683926558>";
            break;
        case "Catalyst":
            weaponTranslation = "Catalyseur";
            weaponEmote = "<:icon_catalyseur:1328118645586526239>";
            break;
        case "Bow":
            weaponTranslation = "Arc";
            weaponEmote = "<:icon_arc:1328116772443787315>";
            break;
        default:
            weaponTranslation = "Non trouvé";
            weaponEmote = "";
            break;
    }

    // Couleur de l'embed en fonction de sa vision
    switch (characterInfos.element) {
        case "Pyro":
            embedColor = "#f51e0f";
            elementEmote = "<:Pyro:1328111225954893864>";
            break;
        case "Hydro":
            embedColor = "#0f8df5";
            elementEmote = "<:Hydro:1328111284721422418>";
            break;
        case "Anemo":
            embedColor = "#0ff5a4";
            elementEmote = "<:Anemo:1328112279585292298>";
            break;
        case "Cryo":
            embedColor = "#0fdaf5";
            elementEmote = "<:Cryo:1328111431534772284>";
            break;
        case "Electro":
            embedColor = "#8d0ff5";
            elementEmote = "<:Electro:1328111540888408196>";
            break;
        case "Geo":
            embedColor = "#f5bb0f";
            elementEmote = "<:Geo:1328111327020978337>";
            break;
        case "Dendro":
            embedColor = "#13f50f";
            elementEmote = "<:Dendro:1328111354866831440>";
            break;
        default:
            embedColor = "#ffffff";
            elementEmote = "";
            break;
    }

    const guideLink = await getGuideLink(characterInfos.formatedValue)
    if (!guideLink || (!guideLink.quickGuide && !guideLink.fullGuide)) {
        return new EmbedBuilder()
            .setTitle("Aucun guide disponible pour ce personnage")
            .setColor(embedColor)
            .setTimestamp();
    }

    // Détermination du lien principal (préférence pour le guide complet)
    const titleUrl = guideLink.fullGuide
        ? guideLink.fullGuideUrl
        : guideLink.quickGuideUrl;

    // Construction de la liste de champs dynamiques
    const guideFields: { name: string; value: string; inline: boolean }[] = [];

    if (guideLink.quickGuide) {
        guideFields.push({
            name: "Guide rapide :",
            value: `[Keqing Mains](${guideLink.quickGuideUrl})`,
            inline: true
        });
    }

    if (guideLink.fullGuide) {
        guideFields.push({
            name: "Guide complet :",
            value: `[Keqing Mains](${guideLink.fullGuideUrl})`,
            inline: true
        });
    }

    // Préparation de l'embed
    return new EmbedBuilder()
        .setTitle(`Build de ${characterInfos.name}`)
        .setURL(titleUrl)
        .setColor(embedColor)
        .addFields(
            ...guideFields,
            {
                name: "Nom :",
                value: characterInfos.name,
                inline: false
            },
            {
                name: "Vision :",
                value: `${characterInfos.element} ${elementEmote}`,
                inline: true
            },
            {
                name: "Nationalité :",
                value: characterInfos.region,
                inline: true
            },
            {
                name: "Arme :",
                value: `${weaponTranslation} ${weaponEmote}`,
                inline: true
            }
        )
        .setThumbnail(`https://enka.network/ui/UI_AvatarIcon_${characterInfos.name}.png`)
        .setImage(
            characterBuilds?.[0]?.url ??
            "https://raw.githubusercontent.com/matheo-1712/Furina/refs/heads/main/api/img/infographies/default_Snezhnaya.png"
        )
        .setFooter({
            text: "Crédits : Keqing Mains - Powered by CitlAPI",
        })
        .setTimestamp();
}