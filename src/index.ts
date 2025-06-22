import { Client, Collection, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "./types";
import {ApiHandler} from "./api-class/ApiHandler";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ]
});

// Initialisation de la base de données
try {
    ApiHandler.registerApiLink()
} catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données :", error);
}

try {
    client.slashCommands = new Collection<string, SlashCommand>();

    const handlersDirs = join(__dirname, "./handlers/discord");

    readdirSync(handlersDirs).forEach(file => {
        require(`${handlersDirs}/${file}`)(client)
    })

} catch (error) {
    console.error("Erreur lors de l'initialisation des commandes slash :", error);
}

client.login(process.env.DISCORD_TOKEN);

