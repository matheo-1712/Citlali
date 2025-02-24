import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { getEnkaData, registerCharactersEnka, registerUidInfosEnka } from "../handlers/data/enkaHandler";
import { UserGi } from "../db/class/UserGi";
import { PlayerCharacter } from "../db/class/PlayerCharacter";
import { UidInfos } from "../db/class/UidInfos";

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
        try {

            // Récupérer l'utilisateur
            const member = interaction.options.get("membre")?.value?.toString();

            // Vérifier si l'utilisateur existe
            if (!member) {
                await interaction.reply("Membre non trouvé.");
                return;
            }

            // Récupérer l'UID Genshin
            const uid = UserGi.getUID(member);
            console.log(uid);

            // Vérifier si l'UID est enregistré
            if (!uid) {
                await interaction.reply("Cet utilisateur n'a pas d'UID enregistré.");
                return;
            }

            // Si l'option "rafraichir" est activée, mettre à jour les informations de l'utilisateur
            if (interaction.options.get("rafraichir")?.value === "maj") {
                try {
                    console.log("Mise à jour des informations de l'utilisateur...");
                    // Récupérer les données de l'UID
                    const data = await getEnkaData(uid);

                    // Enregistrer les infos de l'UID dans la base de données

                    const registerStatusUid = await registerUidInfosEnka(data)

                    if (!registerStatusUid) {
                        console.error("Erreur lors de l'enregistrement des informations de l'UID !");
                    }

                    // Enregistrer les infos des personnages dans la base de données

                    const registerCharactersStatus = await registerCharactersEnka(data)

                    if (!registerCharactersStatus) {
                        console.error("Erreur lors de l'enregistrement des informations des personnages !");
                    }

                } catch (error) {
                    console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
                }
            }

            // Récupérer les informations de l'utilisateur
            const uid_infos = await UidInfos.getPlayerUidInfos(uid);

            // Récupérer les données de l'UID
            const characters = PlayerCharacter.getPlayerCharacters(uid);

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
                .setThumbnail(`https://enka.network/ui/${uid_infos.playerIcon}.png`)
                .setColor("#00b0f4")
                .setFooter({
                    text: "Powered by EnkaNetwork API",
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erreur lors de la récupération des informations du joueur:", error);
            await interaction.reply("Une erreur est survenue lors de la récupération des informations du joueur.");
        }

    }
}
