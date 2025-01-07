import { SlashCommandBuilder } from "discord.js";
import { Character, SlashCommand, UidInfos } from "../types";
import { addCharacter, addUidInfos, addUser, userExists, userHasUid } from "../db";
import { Wrapper } from "enkanetwork.js"

export const command: SlashCommand = {
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
        const hasUidRegistered = userExists(id_discord);
        if (hasUidRegistered) {
            await interaction.reply({ content: "Vous avez déjà un UID enregistré !" });
            return;
        }

        // Vérifier si l'UID est déjà enregistré
        const uidAlreadyRegistered = userHasUid(uid);
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
        const statusAddUser = addUser({ id_discord, uid_genshin: uid });
        if (!statusAddUser) {
            await interaction.reply({ content: "Une erreur est survenue lors de l'enregistrement de votre UID !" });
            return;
        }

        // Récupérer les informations du joueur
        const { genshin } = new Wrapper();

        const playerData = await genshin.getPlayer(uid);

        // Vérifier si le joueur existe
        if (!playerData) {
            await interaction.reply({ content: "Cet UID n'existe pas !" });
            return;
        }

        // Préparation des variables
        const towerFloor = playerData.player.abyss.floor + "-" + playerData.player.abyss.chamber + "-" + playerData.player.abyss.stars + '⭐';


        // Ajouter les informations de l'utilisateur
        const uid_infos: UidInfos = {
            uid: uid,
            nickname: playerData.player.username,
            level: Number(playerData.player.levels.rank),
            signature: playerData.player.signature,
            finishAchievementNum: playerData.player.achievements,
            towerFloor: towerFloor,
            affinityCount: playerData.player.maxFriendshipCount,
            theaterAct: Number(playerData.player.theaterAct),
            theaterMode: playerData.player.theaterMode,
            worldLevel: Number(playerData.player.levels.world),
            
        }
        addUidInfos(uid_infos);

        // Ajouter le personnage au joueur
        for (const characterData of playerData.player.showcase) {
            const character: Character = {
                uid_genshin: uid,
                character_id: Number(characterData.characterId),
                name: characterData.name,
                element: characterData.element,
                level: Number(characterData.level),
                constellations: characterData.constellations,
                icon: characterData.assets.icon,
            }
            addCharacter(character);
        }

        // Répondre à l'utilisateur
        await interaction.reply({ content: "Votre UID a bien été enregistré !" });
    }
}
