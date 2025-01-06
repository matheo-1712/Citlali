import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { getCharacters, getUidInfos, getUserUid } from "../db";

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
        const uid_infos = await getUidInfos(uid);

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
