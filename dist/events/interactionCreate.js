"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const event = {
    name: discord_js_1.Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isChatInputCommand())
            return;
        const command = interaction.client.slashCommands.get(interaction.commandName);
        if (!command)
            return interaction.reply({ content: "Cette commande n'existe pas ou plus !", ephemeral: true });
        await command.execute(interaction);
    }
};
exports.default = event;
