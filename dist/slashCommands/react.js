"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
exports.command = {
    name: "react",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("react")
        .setDescription("Envoie un message avec une réaction"),
    execute: async (interaction) => {
        const message = await interaction.reply({ content: "Message avec réaction", fetchReply: true });
        await message.react("👍");
    }
};
