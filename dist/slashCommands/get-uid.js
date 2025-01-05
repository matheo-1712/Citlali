"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.command = {
    name: "get-uid",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("get-uid")
        .setDescription("Permet de récupérer l'ID Discord d'un membre")
        .addUserOption((option) => {
        return option
            .setName('membre')
            .setDescription("Membre dont vous souhaitez récupérer l'ID Discord")
            .setRequired(true);
    }),
    execute: async (interaction) => {
        // Récupération du membre
        const member = interaction.options.get("membre")?.value?.toString();
        // Vérifie si le membre est valide
        if (!member) {
            await interaction.reply({ content: "Veuillez entrer un membre valide !" });
            return;
        }
        // Récupération de l'UID de l'id Discord
        const uid = (0, db_1.getUid)(member);
        // Vérifie si l'UID existe
        if (!uid) {
            await interaction.reply({ content: "Ce membre n'a pas d'UID enregistré !" });
            return;
        }
        // Répondre au message
        await interaction.reply({ content: `L'UID de ${member} est : ${uid}` });
    }
};
