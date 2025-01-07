import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Character, SlashCommand } from "../types";
import { addCharacter, getCharacters, getUidInfos, getUserUid } from "../db";
import { Wrapper } from "enkanetwork.js";

export const command: SlashCommand = {
    name: "get-uid",
    data: new SlashCommandBuilder()
        .setName("get-uid")
        .setDescription("Permet de récupérer l'ID Discord d'un membre")
        .addUserOption((option) => {
            return option
                .setName('membre')
                .setDescription("Membre dont vous souhaitez récupérer l'ID Discord")
                .setRequired(true);
        })
        .addStringOption((option) => {
            return option
                .setName('rafraichir')
                .setDescription("Mettre à jour les informations de l'utilisateur")
                .setRequired(false)
                .addChoices(
                    { name: "Mise à jour des informations", value: "maj" }
                );
        }),

    execute: async (interaction) => {

        // Récupérer l'utilisateur
        const member = interaction.options.get("membre")?.value?.toString();

        // Vérifier si l'utilisateur existe
        if (!member) {
            await interaction.reply("Membre non trouvé.");
            return;
        }

        // Récupérer l'UID Genshin
        const uid = getUserUid(member);

        // Vérifier si l'UID est enregistré
        if (!uid) {
            await interaction.reply("Cet utilisateur n'a pas d'UID enregistré.");
            return;
        }

        // Récupérer les informations de l'utilisateur
        const uid_infos = getUidInfos(uid);

        // Si l'option "rafraichir" est activée, mettre à jour les informations de l'utilisateur
        if (interaction.options.get("rafraichir")?.value === "maj") {
            // Récupérer les informations du joueur
            const { genshin } = new Wrapper();

            const playerData = await genshin.getPlayer(uid);

            // Vérifier si le joueur existe
            if (!playerData) {
                await interaction.reply({ content: "Cet UID n'existe pas !" });
                return;
            }
            try {
            // Ajouter le personnage au joueur
            for (const characterData of playerData.player.showcase) {
                const character: Character = {
                    uid_genshin: uid,
                    character_id: Number(characterData.characterId),
                    name: characterData.name,
                    element: characterData.element,
                    level: Number(characterData.level),
                    constellations: characterData.constellations,
                    icon: characterData.assets.icon,
                }
                addCharacter(character);
            }
            console.log(`Mise à jour des informations pour l'utilisateur ${uid_infos.nickname} avec succès.`);
            } catch (error) {
                console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
            }
        }

        // Récupérer les personnages du joueur
        const characters = getCharacters(uid);

        // Répondre à l'utilisateur
        const embed = new EmbedBuilder()
            .setAuthor({
                name: "Citlali",
            })
            .addFields(
                {
                    name: `**Nom d'utilisateur :** ${uid_infos.nickname}`,
                    value: `            
                    **UID :** ${uid}
                    **Signature :** ${uid_infos.signature}
                    **Niveau :** ${uid_infos.level}
                    **Achievements :** ${uid_infos.finishAchievementNum}
                    **Abysse :** ${uid_infos.towerFloor}
                    **Affinités :** ${uid_infos.affinityCount}
                    **Théâtre :** ${uid_infos.theaterAct}
                    **Théâtre :** ${uid_infos.theaterMode}
                    **Niveau monde :** ${uid_infos.worldLevel}
                    `,
                    inline: true
                },
                {
                    name: "**Personnages :**",
                    value: `${characters.map(character => character.name).join("\n")}`,
                    inline: true
                }
            )
            .setColor("#00b0f4")
            .setFooter({
                text: "Powered by EnkaNetwork API",
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
