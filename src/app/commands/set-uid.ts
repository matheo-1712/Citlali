import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {setUidEmbed} from "../embeds/commands/set-uid/setUidEmbed";

export default {
    name: "set-uid",
    data: new SlashCommandBuilder()
        .setName("set-uid")
        .setDescription("Permet d'enregistrer votre UID Genshin")
        .addStringOption((option) => {
            return option
                .setName("uid")
                .setDescription("Votre UID Genshin")
                .setRequired(true)
        }),
    execute: async (interaction: ChatInputCommandInteraction) => {

        try {

        // Récupération du message
        const uid = interaction.options.get("uid")?.value?.toString();

        // Récupération de l'utilisateur
        const id_discord = interaction.user.id;

        // Vérifie si le message est vide
        if (!uid) {
            await interaction.reply({embeds: [setUidEmbed("Merci d'écrire un UID", "Red")], flags: "Ephemeral"},);
            return;
        }

        // Vérifier si l'UID est valide
        const regexUid = /^\d{9}$/;
        if (!regexUid.test(uid)) {
            await interaction.reply({
                embeds: [setUidEmbed("Merci d'écrire un UID valide !", "Red")],
                flags: "Ephemeral"
            },);
            return;
        }

        // Vérifier si l'utilisateur a déjà un UID d'enregistré
        if (await Otterlyapi.getDataByAlias("id-discord-to-uid-getUidByIdDiscord", id_discord)) {
            await interaction.reply({
                embeds: [setUidEmbed("Vous avez déjà un UID enregistré.", "Blurple")],
                flags: "Ephemeral"
            },);
            return;
        }

        // Vérifier si l'UID est déjà enregistré
        if (await Otterlyapi.getDataByAlias("id-discord-to-uid-getIdDiscordByUid", uid)) {
            await interaction.reply({
                embeds: [setUidEmbed("Cette UID est déjà enregistré.", "Red")],
                flags: "Ephemeral"
            },);
            return;
        }

        // Enregistrer l'UID dans la base de données
        if (!await Otterlyapi.postDataByAlias("id-discord-to-uid-create", {id_discord: id_discord, uid_genshin: uid})) {
            await interaction.reply({
                embeds: [setUidEmbed("Une erreur est survenue lors de l'enregistrement de votre UID !", "Red")],
                flags: "Ephemeral"
            },);
            return;
        }

        // Répondre à l'utilisateur
        await interaction.reply({
            embeds: [setUidEmbed("Votre UID a bien été enregistré !", "Green")],
            flags: "Ephemeral"
        },);

        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'UID : " + error);
            await interaction.reply({
                embeds: [setUidEmbed("Une erreur est survenue lors de l'enregistrement de votre UID !", "Red")],
            })
        }

    }
}
