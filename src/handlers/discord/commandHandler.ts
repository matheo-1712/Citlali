import { Client, REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "../../types";

module.exports = async (client: Client) => {
    const body: RESTPostAPIApplicationCommandsJSONBody[] = [];
    const slashCommandsDir = join(__dirname, "../../slashCommands");

    readdirSync(slashCommandsDir).forEach(file => {
        if (!file.endsWith(".js")) return

        const command: SlashCommand = require(`${slashCommandsDir}/${file}`).command

        body.push(command.data.toJSON())
        client.slashCommands.set(command.name, command)
    })

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: body })
    } catch (error) {
        console.error(error)
    }
}