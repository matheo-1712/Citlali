import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

export const command: SlashCommand = {
    name: "message",
    data: new SlashCommandBuilder()
        .setName("message")
        .setDescription("Envoie un message")
        .addStringOption((option) => {
            return option
                .setName("message")
                .setDescription("Message à envoyer")
                .setRequired(true)
        }),
    execute: async (interaction) => {
        const message = interaction.options.get("message")?.value?.toString();
        await interaction.reply({ content: `Valeur du message : ${message}` });
    }
}