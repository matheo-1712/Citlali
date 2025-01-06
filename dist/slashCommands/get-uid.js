"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
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
        await interaction.reply({ content: "Récupération de l'UID en cours..." });
    }
};
