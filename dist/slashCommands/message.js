"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
exports.command = {
    name: "message",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("message")
        .setDescription("Envoie un message")
        .addStringOption((option) => {
        return option
            .setName("message")
            .setDescription("Message à envoyer")
            .setRequired(true);
    }),
    execute: async (interaction) => {
        const message = interaction.options.get("message")?.value?.toString();
        await interaction.reply({ content: `Valeur du message : ${message}` });
    }
};
