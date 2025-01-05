"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
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
        const message = interaction.options.get("message")?.value?.toString();
        // Vérifie si le message est vide
        if (!message) {
            await interaction.reply({ content: "Veuillez entrer votre UID !" });
            return;
        }
        // Verification de l'UID
        if (message.length !== 18) {
            await interaction.reply({ content: "Votre UID doit contenir 18 caractères !" });
            return;
        }
        // TODO : Vérifier si l'UID est déjà enregistré
        // TODO : Enregistrer l'UID
        // TODO : Récupérer les informations du joueur
        // TODO : Répondre au message
    }
};
