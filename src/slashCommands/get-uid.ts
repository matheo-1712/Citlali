import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { getUid } from "../db";

export const command: SlashCommand = {
    name: "get-uid",
    data: new SlashCommandBuilder()
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

        // TODO : Vérifier si le membre est valide

        // TODO : Récupérer l'UID Genshin correspondant à l'ID Discord

        // TODO : Récupérer les informations du joueur

        // TODO : Répondre au message

    }
};
