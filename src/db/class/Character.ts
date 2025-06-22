import {ApiHandler} from "./ApiHandler";

export type CharacterType = {
    id?: number,
    name: string,
    weapon: string,
    element: string,
    region: string,
    portraitLink: string,
    formatedValue: string,
}

/**
 * Represents a playable character with a set of attributes and database operations.
 */

export class Character implements CharacterType {
    id?: number;
    name: string;
    weapon: string;
    element: string;
    region: string;
    portraitLink: string;
    formatedValue: string;

    constructor(name: string, weapon: string, element: string, region: string, portraitLink: string, formatedValue: string) {
        this.name = name;
        this.weapon = weapon;
        this.element = element;
        this.region = region;
        this.portraitLink = portraitLink;
        this.formatedValue = formatedValue;
    }

    toString(): string {
        return `Character (name: ${this.name}, weapon: ${this.weapon}, vision: ${this.element}, region: ${this.region}, portraitLink: ${this.portraitLink}, value: ${this.formatedValue})`;
    }

    // Récupérer tous les personnages
    static async getAll(): Promise<Character[]> {
        try {
            // Récupérer l'URL de l'API
            const url = await ApiHandler.getApiLink("characters-getAll");
            if (!url) return [];

            // Appel à l'API
            const response = await fetch(url.route);
            const json = await response.json();

            // Vérification et extraction des données
            if (!json.success || !Array.isArray(json.data)) {
                console.warn("Réponse inattendue :", json);
                return [];
            }

            // Retourne les personnages extraits
            return json.data as Character[];
        } catch (error) {
            console.error("Erreur lors de la récupération des personnages :", error);
            return [];
        }
    }

    // Récupérer un personnage
    static async getCharacterInfos(value: string): Promise<Character | null> {
        try {
            // Récupérer l'URL de l'API
            const url = await ApiHandler.getApiLink("characters-getByValue");
            if (!url) return null;

            // Appel à l'API
            const response = await fetch(`${url.route}${value}`);

            const json = await response.json();

            // Vérification et extraction des données
            if (!json.success || !json.data) {
                console.warn("Réponse inattendue :", json);
                return null;
            }

            // Retourne les informations du personnage
            return json.data as Character;

        } catch (error) {
            console.error(error);
            return null;
        }
    }
} 