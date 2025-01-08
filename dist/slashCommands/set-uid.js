"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const enkaHandler_1 = require("../utils/enkaApi/enkaHandler");
exports.command = {
    name: "set-uid",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("set-uid")
        .setDescription("Permet d'enregistrer votre UID Genshin")
        .addStringOption((option) => {
        return option
            .setName("uid")
            .setDescription("Votre UID Genshin")
            .setRequired(true);
    }),
    execute: async (interaction) => {
        // Récupération du message
        const uid = interaction.options.get("uid")?.value?.toString();
        // Récupération de l'utilisateur
        const user = interaction.user;
        const id_discord = user.id;
        // Vérifie si le message est vide
        if (!uid) {
            await interaction.reply({ content: "Veuillez entrer votre UID !" });
            return;
        }
        // Vérifier si l'utilisateur a déjà un UID d'enregistré
        const hasUidRegistered = (0, db_1.userExists)(id_discord);
        if (hasUidRegistered) {
            await interaction.reply({ content: "Vous avez déjà un UID enregistré !" });
            return;
        }
        // Vérifier si l'UID est déjà enregistré
        const uidAlreadyRegistered = (0, db_1.userHasUid)(uid);
        if (uidAlreadyRegistered) {
            await interaction.reply({ content: "Cet UID est déjà enregistré !" });
            return;
        }
        // Vérifier si l'UID est valide
        const regexUid = /^\d{9}$/;
        if (!regexUid.test(uid)) {
            await interaction.reply({ content: "Votre UID doit contenir 9 chiffres et contient uniquement des chiffres !" });
            return;
        }
        // Enregistrer l'UID dans la base de données
        const statusAddUser = (0, db_1.addUser)({ id_discord, uid_genshin: uid });
        if (!statusAddUser) {
            await interaction.reply({ content: "Une erreur est survenue lors de l'enregistrement de votre UID !" });
            return;
        }
        try {
            // Récupérer les données de l'UID
            const data = await (0, enkaHandler_1.getEnkaData)(uid);
            // Enregistrer les infos de l'UID dans la base de données
            const registerStatusUid = await (0, enkaHandler_1.registerUidInfosEnka)(data);
            if (!registerStatusUid) {
                console.error("Erreur lors de l'enregistrement des informations de l'UID !");
            }
            // Enregistrer les infos des personnages dans la base de données
            const registerCharactersStatus = await (0, enkaHandler_1.registerCharactersEnka)(data);
            if (!registerCharactersStatus) {
                console.error("Erreur lors de l'enregistrement des informations des personnages !");
            }
        }
        catch (error) {
            console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
        }
        // Répondre à l'utilisateur
        await interaction.reply({ content: "Votre UID a bien été enregistré !" });
    }
};
