import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

export const command: SlashCommand = {
    name: "ping",
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Teste la connexion au bot"),
    execute: async (interaction) => {
        await interaction.reply({ embeds: [new EmbedBuilder()
            .setAuthor({name : "Citlali"})
            .setDescription('Pong! \n Ping : ' + interaction.client.ws.ping)
            .setColor("#FF0000")
        ]})
    }
}