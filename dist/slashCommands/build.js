"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
exports.command = {
    name: "build",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("build")
        .setDescription("Affiche le build du personnage demandé"),
    execute: async (interaction) => {
        await interaction.reply(`Pas encore implémenté !`);
    }
};
