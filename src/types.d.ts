import { Collection, CommandInteraction, SlashCommandBuilder } from "discord.js";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            DISCORD_CLIENT_ID: string;
            DEV_SERVEUR: string;
        }
    }
}

declare module "discord.js" {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>
    }
}

export interface BotEvent {
    name: string,
    once?: boolean | false,
    execute: (...args) => void
}

export interface SlashCommand {
    name: string,
    data: SlashCommandBuilder | any,
    async execute: (interaction: CommandInteraction) => Promise<void>
    async execute?: (interaction: CommandInteraction) => Promise<void>
    async autocomplete?: (interaction: CommandInteraction) => Promise<void>
}

// Database interfaces

export type User = {
    id_discord: string,
    uid_genshin: string | null; 
}

export type PlayerCharacter = {
    uid_genshin: string,
    character_id: number,
    name: string,
    element: string,
    level: number,
    constellations: number,
    icon: string,
}

export type UidInfos = {
    uid: string,
    nickname: string,
    level: number,
    worldLevel: number,
    signature: string,
    finishAchievementNum: number,
    towerFloor: string,
    affinityCount: number,
    theaterAct: number,
    theaterMode: string,
    playerIcon: string,
}

export type Character = {
    name: string,
    weapon: string,
    vision: string,
    region: string,
    portraitLink: string,
    value: string,
}

export type Infographic = {
    character: string,
    build: string,
    url: string,
}

export { };