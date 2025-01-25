import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { getEnkaData, registerCharactersEnka, registerUidInfosEnka } from "../handlers/data/enkaHandler";
import { UserGi } from "../db/class/UserGi";

export const command: SlashCommand = {
    name: "set-uid",
    data: new SlashCommandBuilder()
        .setName("set-uid")
        .setDescription("Permet d'enregistrer votre UID Genshin")
        .addStringOption((option) => {
            return option
                .setName("uid")
                .setDescription("Votre UID Genshin")
                .setRequired(true)
        }),
    execute: async (interaction) => {

        // Récupération du message
        const uid = interaction.options.get("uid")?.value?.toString();

        // Récupération de l'utilisateur
        const id_discord = interaction.user.id;

        // Vérifie si le message est vide
        if (!uid) {
            await interaction.reply({ content: "Veuillez entrer votre UID !" });
            return;
        }

        // Vérifier si l'utilisateur a déjà un UID d'enregistré
        if (await UserGi.exists(id_discord)) {
            await interaction.reply({ content: "Vous avez déjà un UID enregistré !" });
            return;
        }

        // Vérifier si l'UID est déjà enregistré
        if (await UserGi.uidExists(uid)) {
            await interaction.reply({ content: "Cet UID est déjà enregistré !" });
            return;
        }

        // Vérifier si l'UID est valide
        const regexUid = /^\d{9}$/;
        if (!regexUid.test(uid)) {
            await interaction.reply({ content: "Votre UID doit contenir 9 chiffres et contient uniquement des chiffres !" });
            return;
        }

        // Enregistrer l'UID dans la base de données
        if (!await UserGi.add({ id_discord, uid_genshin: uid })) {
            await interaction.reply({ content: "Une erreur est survenue lors de l'enregistrement de votre UID !" });
            return;
        }

        try {
            // Récupérer les données de l'UID
            const data = await getEnkaData(uid);
            
            if (!await registerUidInfosEnka(data)) {
                console.error("Erreur lors de l'enregistrement des informations de l'UID !");
            }
            
            if (!await registerCharactersEnka(data)) {
                console.error("Erreur lors de l'enregistrement des informations des personnages !");
            }

        } catch (error) {
            console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
        }

        // Répondre à l'utilisateur
        await interaction.reply({ content: "Votre UID a bien été enregistré !" });
    }
}
