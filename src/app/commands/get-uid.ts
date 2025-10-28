import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {UidInfosType} from "../types/UidInfosType";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {UserType} from "../types/UserType";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {getUidEmbed} from "../embeds/getUidEmbed";

export default {
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

    execute: async (interaction: ChatInputCommandInteraction) => {
        try {

            // Récupérer l'utilisateur
            const member = interaction.options.get("membre")?.value?.toString();
            console.log(member)

            // Vérifier si l'utilisateur existe
            if (!member) {
                await interaction.reply("Membre non trouvé.");
                return;
            }

            // Récupérer l'UID Genshin
            const uid: UserType | undefined = await Otterlyapi.getDataByAlias("id-discord-to-uid-getByUid", member  )

            // Vérifier si l'UID est enregistré
            if (!uid) {
                await interaction.reply("Cet utilisateur n'a pas d'UID enregistré.");
                return;
            }

            // Si l'option "rafraichir" est activée, mettre à jour les informations de l'utilisateur
            if (interaction.options.get("rafraichir")?.value === "maj") {
                try {
                    await Otterlyapi.postDataByAlias("uid-infos-refresh",{uid_genshin: uid.uid_genshin})
                } catch (error) {
                    otterlogs.error("Erreur lors de la mise à jour des informations de l'utilisateur: " + error);
                }
            }

            // Récupérer les informations de l'utilisateur
            if (!uid?.uid_genshin) {
                await interaction.reply("Une erreur est survenue lors de la récupération des informations du joueur.");
                return;
            }
            const uid_infos: UidInfosType | undefined = await Otterlyapi.getDataByAlias("uid-infos-getByUid", uid.uid_genshin)

            // Répondre à l'utilisateur
            const embed = await getUidEmbed(uid_infos)

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            otterlogs.error("Erreur lors de la récupération des informations du joueur: " + error);
            await interaction.reply("Une erreur est survenue lors de la récupération des informations du joueur.");
        }
    }
}
