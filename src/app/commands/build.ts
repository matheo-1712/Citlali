import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";

import { buildEmbed } from "../embeds/buildEmbed";
import { CharacterInfosType } from "../types/CharacterInfos";
import { InfographicType } from "../types/Infographic";
import { Otterlyapi } from "../../otterbots/utils/otterlyapi/otterlyapi";
import { otterlogs } from "../../otterbots/utils/otterlogs";

export default {
    name: "build",
    data: new SlashCommandBuilder()
        .setName("build")
        .setDescription("Affiche le build du personnage demandé")
        .addStringOption(option =>
            option
                .setName("personnage")
                .setDescription("Le personnage dont vous souhaitez afficher le build")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    /**
     * Autocomplétion pour le nom du personnage
     */
    async autocomplete(interaction: AutocompleteInteraction) {
        try {
            const focusedValue = interaction.options.getFocused();
            const allCharacters = await Otterlyapi.getDataByAlias("characters-getAll");

            const characters = Array.isArray(allCharacters) ? allCharacters : [];

            // Filtrage selon la saisie utilisateur
            const filtered = characters.filter(
                (char: { name: string }) =>
                    char.name.toLowerCase().startsWith(focusedValue.toLowerCase())
            );

            // Formatage pour Discord (limite de 25)
            const results = filtered.slice(0, 25).map(
                (c: { name: string; formatedValue: string }) => ({
                    name: c.name,
                    value: c.formatedValue
                })
            );

            await interaction.respond(results).catch(() => {});
        } catch (error) {
            otterlogs.error("Error in autocomplete: " + error);
            await interaction
                .respond([{ name: "⚠️ Erreur lors du chargement", value: "error" }])
                .catch(() => {});
        }
    },

    /**
     * Exécution de la commande /build
     */
    async execute(interaction: ChatInputCommandInteraction) {
        let characterInfos: CharacterInfosType | undefined;
        let characterBuilds: InfographicType[] | null | undefined;
        let embed: EmbedBuilder;

        try {
            const characterValue = interaction.options.getString("personnage");

            if (!characterValue) {
                return interaction.reply(
                    "❌ Impossible de récupérer le nom du personnage."
                );
            }

            characterInfos = await Otterlyapi.getDataByAlias(
                "characters-getByValue",
                characterValue
            );

            if (!characterInfos?.id) {
                return interaction.reply(
                    "❌ Aucune information trouvée pour ce personnage."
                );
            }

            // Récupération des builds du personnage
            characterBuilds = await Otterlyapi.getDataByAlias(
                "infographics-getByIdGenshinCharacter",
                characterInfos.id.toString()
            );
            embed = await buildEmbed(characterInfos, characterBuilds ?? []);

        } catch (error) {
            console.error(error);
            return interaction.reply(
                "⚠️ Une erreur est survenue lors de la récupération des informations du personnage."
            );
        }

        try {
            const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];
            let currentRow = new ActionRowBuilder<ButtonBuilder>();

            if (characterBuilds?.length) {
                for (const build of characterBuilds) {
                    const button = new ButtonBuilder()
                        .setCustomId(build.build)
                        .setLabel(build.build)
                        .setStyle(1); // Primary

                    currentRow.addComponents(button);

                    // Max 5 boutons par ligne
                    if (currentRow.components.length === 5) {
                        actionRows.push(currentRow);
                        currentRow = new ActionRowBuilder<ButtonBuilder>();
                    }
                }

                // Ajout de la dernière ligne
                if (currentRow.components.length > 0) {
                    actionRows.push(currentRow);
                }
            }

            const message = await interaction.reply({
                embeds: [embed],
                components: actionRows
            });

            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60_000
            });

            collector.on("collect", async i => {
                await i.deferUpdate();

                const build = characterBuilds?.find(b => b.build === i.customId);
                if (!build) {
                    return interaction.editReply({
                        content:
                            "❌ Une erreur est survenue lors de la récupération du build.",
                        components: []
                    });
                }

                const url =
                    build.url ??
                    "https://furina.antredesloutres.fr/infographie/default_Snezhnaya.png";

                await interaction.editReply({
                    embeds: [embed.setImage(url)],
                    components: actionRows
                });
            });

            collector.on("end", async () => {
                await interaction.editReply({ components: [] });
            });

        } catch (error) {
            console.error("Erreur lors de la création de l'interface:", error);
            await interaction.reply(
                "⚠️ Une erreur est survenue lors de la création de l'interface."
            );
        }
    }
};
