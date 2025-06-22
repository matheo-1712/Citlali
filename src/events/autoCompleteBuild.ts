import { Events, Interaction } from "discord.js";
import { BotEvent } from "../types";
import { Character } from "../api-class/Character";

let characterList: Character[] = [];

(async () => {
    characterList = await Character.getAll();
})();

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "build") return;

        const focusedValue = interaction.options.getFocused();

        const filteredChoices = characterList.filter((characterList) =>
            characterList.name.toLowerCase().startsWith(focusedValue.toLowerCase())
        )

        const results = filteredChoices.map((choice) => {
            return {
                name: `${choice.name}`,
                value: `${choice.formatedValue}`
            }
        })
        interaction.respond(results.slice(0, 25)).catch(() => {});
    }
}

export default event;