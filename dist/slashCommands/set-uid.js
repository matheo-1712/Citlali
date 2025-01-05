"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.command = {
    name: "set-uid",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("set-uid")
        .setDescription("Permet d'enregistrer votre UID Genshin")
        .addStringOption((option) => {
        return option
            .setName("uid")
            .setDescription("Votre UID Genshin")
            .setRequired(true);
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
        if ((0, db_1.getUid)(interaction.user.id)) {
            await interaction.reply({ content: "Vous avez déjà enregistré un UID !" });
            return;
        }
        // Vérifier si l'UID est déjà enregistré
        if ((0, db_1.getUidByUid)(uid)) {
            await interaction.reply({ content: "Cet UID est déjà enregistré !" });
            return;
        }
        // Vérifier si l'UID est valide 
        if (!regexUid.test(uid)) {
            await interaction.reply({ content: "Votre UID doit contenir 9 chiffres !" });
            return;
        }
        // Enregistrer l'UID
        (0, db_1.setUid)(interaction.user.id, uid);
        await interaction.reply({ content: "Votre UID a bien été enregistré !" });
        // TODO : Récupérer les informations du joueur
        // TODO : Répondre au message
    }
};
