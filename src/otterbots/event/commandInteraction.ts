import {Client} from "discord.js";
import {otterlogs} from "../utils/otterlogs";

/**
 * Handles interaction events for chat input commands and executes the appropriate command logic.
 *
 * @param {Client} client - The Discord.js client instance used to handle events and manage interactions.
 * @return {void} This function does not return a value; it sets up event listeners for the client.
 */
export async function otterBots_interactionCreate(client: Client): Promise<void> {

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.slashCommands.get(interaction.commandName);
        if (!command) {
            otterlogs.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            otterlogs.error(`${error}`);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: '🦦 Oups! Une loutre a fait tomber le serveur dans l\'eau! La commande n\'a pas pu être exécutée.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '🦦 La loutre responsable de cette commande est partie faire la sieste! Réessayez plus tard.',
                    ephemeral: true
                });
            }
        }
    });
}