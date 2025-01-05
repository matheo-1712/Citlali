import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { getUid, getUidByUid, setUid } from "../db";

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

        // Vérifie si le message est vide
        if (!uid) {
            await interaction.reply({ content: "Veuillez entrer votre UID !" });
            return;
        }

        // Verification de l'UID

        // Format de l'UID
        const regexUid = /^\d{9}$/;

        // Vérifier si l'utilisateur a déjà un UID d'enregistré
        if (getUid(interaction.user.id)) {
            await interaction.reply({ content: "Vous avez déjà enregistré un UID !" });
            return;
        }

        // Vérifier si l'UID est déjà enregistré
        if (getUidByUid(uid)) {
            await interaction.reply({ content: "Cet UID est déjà enregistré !" });
            return;
        }

        // Vérifier si l'UID est valide 
        if (!regexUid.test(uid)) {
            await interaction.reply({ content: "Votre UID doit contenir 9 chiffres !" });
            return;
        }

        // Enregistrer l'UID
        setUid(interaction.user.id, uid);
        await interaction.reply({ content: "Votre UID a bien été enregistré !" });

        // TODO : Récupérer les informations du joueur

        // TODO : Répondre au message

    }
}