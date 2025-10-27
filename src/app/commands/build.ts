import {
    ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder
} from "discord.js";
import {buildEmbed} from "../embeds/buildEmbed";
import {CharacterInfosType} from "../types/CharacterInfos";
import {InfographicType} from "../types/Infographic";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";

export default {
    name: "build",
    data: new SlashCommandBuilder()
        .setName("build")
        .setDescription("Affiche le build du personnage demandé")
        .addStringOption((option) => {
            return option
                .setName("personnage")
                .setDescription("Le personnage dont vous souhaitez afficher le build")
                .setRequired(true)
                .setAutocomplete(true)
        }),

    execute: async (interaction: ChatInputCommandInteraction) => {

        // On instancie les variables
        let characterInfos: CharacterInfosType | undefined
        let characterBuilds: InfographicType[] | null

        try {
            // Récupérer le personnage demandé
            const characterValue = interaction.options.get("personnage")?.value?.toString();

            // On vérifie si le personnage existe
            if (!characterValue) {
                await interaction.reply("Une erreur est survenue lors de la récupération de la value du personnage.");
                return;
            }
            // Récupérer les informations du personnage
            characterInfos = await Otterlyapi.getDataByAlias("characters-getByValue", characterValue)

            // On vérifie si les informations du personnage existe
            if (!characterInfos?.id) {
                await interaction.reply("Une erreur est survenue lors de la récupération du nom du personnage.");
                return;
            }
            // Obtenir la liste des infographies disponibles pour le personnage
            characterBuilds = await Infographic.getCharacterBuilds(characterInfos.id);

            // Préparer le lien du guide du personnage
            const guideLink = `https://keqingmains.com/q/${characterInfos.formatedValue}-quickguide/`

            // Gestion des informations de l'embed
            const embed = buildEmbed(characterInfos, guideLink, characterBuilds)

            // Création de la liste des builds
            const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];
            let currentRow = new ActionRowBuilder<ButtonBuilder>();

            for (const build of characterBuilds) {
                const button = new ButtonBuilder()
                    .setCustomId(`${build.build}`)
                    .setLabel(build.build)
                    .setStyle(1);

                // Ajout du bouton à la ligne actuelle
                currentRow.addComponents(button);

                // Si la ligne contient 5 boutons, on la sauvegarde et on en crée une nouvelle
                if (currentRow.components.length === 5) {
                    actionRows.push(currentRow);
                    currentRow = new ActionRowBuilder<ButtonBuilder>();
                }
            }

            // Ajout de la dernière ligne si elle contient des boutons
            if (currentRow.components.length > 0) {
                actionRows.push(currentRow);
            }

            // Envoi de la réponse avec plusieurs lignes si nécessaire
            const message = await interaction.reply({embeds: [embed], components: actionRows});

            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60_000
            });

            // Edition du message lorsque le bouton est cliqué
            collector.on('collect', async (i: { customId: any; deferUpdate: () => any; }) => {

                // Récupérer le bouton cliqué
                const button = i.customId;

                // Déférer la réponse pour éviter le timeout
                await i.deferUpdate();

                // Récupérer l'infographie correspondante
                const build = characterBuilds.find(build => build.build === button);
                if (!build) {
                    await interaction.editReply({
                        content: 'Une erreur est survenue lors de la récupération de l\'infographie.',
                        components: []
                    });
                    return;
                }

                // Récupération de l'URL de l'infographie
                const url = build.url ?? "https://furina.antredesloutres.fr/infographie/default_Snezhnaya.png";

                // Éditer le message initial avec l'embed correspondant
                await interaction.editReply({
                    content: 'Voici l\'infographie du build : ' + build.build,
                    embeds: [(await embed).setImage(url)],
                    components: actionRows
                });
            });

            collector.on('end', async () => {
                await interaction.editReply({components: []});
            });

        } catch (error) {
            console.error("Erreur lors de la récupération des informations du personnage:", error);
            await interaction.reply("Une erreur est survenue lors de la récupération des informations du personnage.");
        }
    }
}