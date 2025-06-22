
export type PlayerCharacterType = {
    uid_genshin: string,
    character_id: number,
    name: string,
    element: string,
    level: number,
    constellations: number,
    icon: string,
}

export class PlayerCharacter implements PlayerCharacterType {
    uid_genshin: string;
    character_id: number;
    name: string;
    element: string;
    level: number;
    constellations: number;
    icon: string;

    constructor(uid_genshin: string, character_id: number, name: string, element: string, level: number, constellations: number, icon: string) {
        this.uid_genshin = uid_genshin;
        this.character_id = character_id;
        this.name = name;
        this.element = element;
        this.level = level;
        this.constellations = constellations;
        this.icon = icon;
    }

    toString(): string {
        return `PlayerCharacter(uid_genshin=${this.uid_genshin}, character_id=${this.character_id}, name=${this.name}, element=${this.element}, level=${this.level}, constellations=${this.constellations}, icon=${this.icon})`;
    }

    // NOT IMPLEMENTED FOR NOW

}