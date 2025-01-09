import { Client, Collection, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "./types";
import { initializeDatabase } from "./db";
import { registerInfographicsLink } from "./handlers/data/infographiesHandler";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ]
});

initializeDatabase();

// Lancement de l'enregistrement des infographies
registerInfographicsLink();

client.slashCommands = new Collection<string, SlashCommand>();

const handlersDirs = join(__dirname, "./handlers/discord");

readdirSync(handlersDirs).forEach(file => {
    require(`${handlersDirs}/${file}`)(client)
})

client.login(process.env.DISCORD_TOKEN);

