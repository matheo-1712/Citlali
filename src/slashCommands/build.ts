import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

export const command: SlashCommand = {
    name: "build",
    data: new SlashCommandBuilder()
        .setName("build")
        .setDescription("Affiche le build du personnage demandé"),
    execute: async (interaction) => {
        await interaction.reply(`Pas encore implémenté !`);
    }
}