import { ActionRowBuilder, ButtonBuilder, ColorResolvable, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Character } from "../api-class/Character";
import { Infographic } from "../api-class/Infographic";
import { SlashCommand } from "../types";

export const command: SlashCommand = {
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

    execute: async (interaction) => {

        let characterInfos: Character | null;
        let characterBuilds: Infographic[];

        try {
            // Récupérer le personnage demandé
            const characterValue = interaction.options.get("personnage")?.value?.toString();

            // Récupérer les informations du personnage
            if (characterValue) {
                characterInfos = await Character.getCharacterInfos(characterValue);
            } else {
                await interaction.reply("Une erreur est survenue lors de la récupération de la value du personnage.");
                return;
            }

            // Obtenir la liste des infographies disponibles pour le personnage
            if (characterInfos && characterInfos.id) {
                characterBuilds = await Infographic.getCharacterBuilds(characterInfos.id);
            } else {
                await interaction.reply("Une erreur est survenue lors de la récupération du nom du personnage.");
                return;
            }

            // Préparer le lien du guide du personnage
            const guideLink = `https://keqingmains.com/q/${characterInfos.formatedValue}-quickguide/`

            // Gestion des informations de l'embed

            // Déclaration des variables
            let embedColor: ColorResolvable;
            let elementEmote: string;
            let weaponTranslation: string;
            let weaponEmote: string;

            // Gestion de l'arme 
            switch (characterInfos.weapon) {
                case "Sword": weaponTranslation = "Épée"; weaponEmote = "<:icon_sword:1328118474588815401>"; break;
                case "Claymore": weaponTranslation = "Claymore"; weaponEmote = "<:icon_claymore:1328118750733537302>"; break;
                case "Polearm": weaponTranslation = "Lance"; weaponEmote = "<:icon_lance:1328117598683926558>"; break;
                case "Catalyst": weaponTranslation = "Catalyseur"; weaponEmote = "<:icon_catalyseur:1328118645586526239>"; break;
                case "Bow": weaponTranslation = "Arc"; weaponEmote = "<:icon_arc:1328116772443787315>"; break;
                default: weaponTranslation = "Non trouvé"; weaponEmote = ""; break;
            }

            // Couleur de l'embed en fonction de sa vision  
            switch (characterInfos.element) {
                case "Pyro": embedColor = "#f51e0f"; elementEmote = "<:Pyro:1328111225954893864>"; break;
                case "Hydro": embedColor = "#0f8df5"; elementEmote = "<:Hydro:1328111284721422418>"; break;
                case "Anemo": embedColor = "#0ff5a4"; elementEmote = "<:Anemo:1328112279585292298>"; break;
                case "Cryo": embedColor = "#0fdaf5"; elementEmote = "<:Cryo:1328111431534772284>"; break;
                case "Electro": embedColor = "#8d0ff5"; elementEmote = "<:Electro:1328111540888408196>"; break;
                case "Geo": embedColor = "#f5bb0f"; elementEmote = "<:Geo:1328111327020978337>"; break;
                case "Dendro": embedColor = "#13f50f"; elementEmote = "<:Dendro:1328111354866831440>"; break;
                default: embedColor = "#ffffff"; elementEmote = ""; break;
            }

            // Préparation de l'embed
            const embed = new EmbedBuilder()
                .setTitle(`Build de ${characterInfos.name}`)
                .setURL(guideLink)
                .setColor(embedColor)
                .addFields(
                    {
                        name: "Nom :",
                        value: characterInfos.name,
                        inline: true
                    },
                    {
                        name: "Vision :",
                        value: characterInfos.element + " " + elementEmote,
                        inline: true
                    },
                    {
                        name: "Nationalité :",
                        value: characterInfos.region,
                        inline: false
                    },
                    {
                        name: "Arme :",
                        value: weaponTranslation + " " + weaponEmote,
                        inline: true
                    },
                )
                .setThumbnail(characterInfos.portraitLink)
                // Affichage de la première infographie
                .setImage(characterBuilds[0].url ?? "https://furina.antredesloutres.fr/infographie/default_Snezhnaya.png")
                .setFooter({
                    text: "Crédits : Keqing Mains - Powered by CitlAPI",
                }).setTimestamp();

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
            const message = await interaction.reply({ embeds: [embed], components: actionRows });

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });

            // Edition du message lorsque le bouton est cliqué
            collector.on('collect', async i => {

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
                    content: 'Voici l\'infographie du build : ' + build.build,
                    embeds: [embed.setImage(url)],
                    components: actionRows
                });
            });

            collector.on('end', async i => {
                await interaction.editReply({ components: [] });
            });

        } catch (error) {
            console.error("Erreur lors de la récupération des informations du personnage:", error);
            await interaction.reply("Une erreur est survenue lors de la récupération des informations du personnage.");
        }
    }
}