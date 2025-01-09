"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.command = {
    name: "build",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("build")
        .setDescription("Affiche le build du personnage demandé")
        .addStringOption((option) => {
        return option
            .setName("personnage")
            .setDescription("Le personnage dont vous souhaitez afficher le build")
            .setRequired(true)
            .setAutocomplete(true);
    }),
    execute: async (interaction) => {
        let characterInfos;
        let characterBuilds;
        try {
            // Récupérer le personnage demandé
            const characterValue = interaction.options.get("personnage")?.value?.toString();
            // Récupérer les informations du personnage
            if (characterValue) {
                characterInfos = (0, db_1.getCharacterInfos)(characterValue);
                console.log(characterInfos);
            }
            else {
                await interaction.reply("Une erreur est survenue lors de la récupération de la value du personnage.");
                return;
            }
            // Obtenir la liste des infographies disponibles pour le personnage
            if (characterInfos) {
                characterBuilds = (0, db_1.getCharacterBuilds)(characterInfos.name);
                console.log(characterBuilds);
            }
            else {
                await interaction.reply("Une erreur est survenue lors de la récupération du nom du personnage.");
                return;
            }
            // Préparation de l'embed
            const embed = new discord_js_1.EmbedBuilder()
                .setAuthor({
                name: "Citlali",
            })
                // Affichage de la première infographie
                .setImage(`${characterBuilds[0].url}`)
                .setFooter({
                text: "Crédits : Keqing Mains - Citlali",
            }).setTimestamp();
            // Création de la liste des builds
            const actionRows = [];
            let currentRow = new discord_js_1.ActionRowBuilder();
            for (const build of characterBuilds) {
                const button = new discord_js_1.ButtonBuilder()
                    .setCustomId(`${build.build}`)
                    .setLabel(build.build)
                    .setStyle(1);
                // Ajout du bouton à la ligne actuelle
                currentRow.addComponents(button);
                // Si la ligne contient 5 boutons, on la sauvegarde et on en crée une nouvelle
                if (currentRow.components.length === 5) {
                    actionRows.push(currentRow);
                    currentRow = new discord_js_1.ActionRowBuilder();
                }
            }
            // Ajout de la dernière ligne si elle contient des boutons
            if (currentRow.components.length > 0) {
                actionRows.push(currentRow);
            }
            // Envoi de la réponse avec plusieurs lignes si nécessaire
            const message = await interaction.reply({ embeds: [embed], components: actionRows });
            const collector = message.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.Button, time: 60000 });
            // Edition du message lorsque le bouton est cliqué
            collector.on('collect', async (i) => {
                // Récupérer le bouton cliqué
                const button = i.customId;
                // Déférer la réponse pour éviter le timeout
                await i.deferUpdate();
                // Récupérer l'infographie correspondante
                const build = characterBuilds.find(build => build.build === button);
                if (!build) {
                    await interaction.editReply({ content: 'Une erreur est survenue lors de la récupération de l\'infographie.', components: [] });
                    return;
                }
                // Récupération de l'URL de l'infographie
                const url = build.url;
                // Éditer le message initial avec l'embed correspondant
                await interaction.editReply({
                    content: 'Voici l\'infographie correspondante :',
                    embeds: [embed.setImage(url)],
                    components: actionRows
                });
            });
            collector.on('end', async (i) => {
                await interaction.editReply({ components: [] });
            });
        }
        catch (error) {
            console.error("Erreur lors de la récupération des informations du personnage:", error);
            await interaction.reply("Une erreur est survenue lors de la récupération des informations du personnage.");
        }
    }
};
