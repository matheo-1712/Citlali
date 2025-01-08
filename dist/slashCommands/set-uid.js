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
        // Récupération de l'utilisateur
        const user = interaction.user;
        const id_discord = user.id;
        // Vérifie si le message est vide
        if (!uid) {
            await interaction.reply({ content: "Veuillez entrer votre UID !" });
            return;
        }
        // Vérifier si l'utilisateur a déjà un UID d'enregistré
        const hasUidRegistered = (0, db_1.userExists)(id_discord);
        if (hasUidRegistered) {
            await interaction.reply({ content: "Vous avez déjà un UID enregistré !" });
            return;
        }
        // Vérifier si l'UID est déjà enregistré
        const uidAlreadyRegistered = (0, db_1.userHasUid)(uid);
        if (uidAlreadyRegistered) {
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
        const statusAddUser = (0, db_1.addUser)({ id_discord, uid_genshin: uid });
        if (!statusAddUser) {
            await interaction.reply({ content: "Une erreur est survenue lors de l'enregistrement de votre UID !" });
            return;
        }
        try {
            await (0, db_1.createProfile)(uid);
        }
        catch (error) {
            console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
        }
        // Répondre à l'utilisateur
        await interaction.reply({ content: "Votre UID a bien été enregistré !" });
    }
};
