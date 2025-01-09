"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const characterList = (0, db_1.getCharactersList)();
const event = {
    name: discord_js_1.Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isAutocomplete())
            return;
        if (interaction.commandName !== "build")
            return;
        const focusedValue = interaction.options.getFocused();
        const filteredChoices = characterList.filter((characterList) => characterList.name.toLowerCase().startsWith(focusedValue.toLowerCase()));
        const results = filteredChoices.map((choice) => {
            return {
                name: `${choice.name}`,
                value: `${choice.value}`
            };
        });
        interaction.respond(results.slice(0, 25)).catch(() => { });
    }
};
exports.default = event;
