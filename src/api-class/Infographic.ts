import {ApiHandler} from "./ApiHandler";

// Type de la classe
export type InfographicType = {
    character: string,
    build: string,
    url: string,
}

export class Infographic implements InfographicType {
    character: string;
    build: string;
    url: string;

    constructor(character: string, build: string, url: string) {
        this.character = character;
        this.build = build;
        this.url = url;
    }

    toString(): string {
        return `Infographic(character=${this.character}, build=${this.build}, url=${this.url})`;
    }

    // Récupérer les infographies d'un personnage
    static async getCharacterBuilds(id: number): Promise<Infographic[]> {
        try {
            // Récupérer l'URL de l'API
            const url = await ApiHandler.getApiLink("infographics-getByIdGenshinCharacter");
            if (!url) return [];

            // Appel à l'API
            const response = await fetch(`${url.route}/${id}`);
            const json = await response.json();

            // Vérification et extraction des données
            if (!json.success || !Array.isArray(json.data)) {
                console.warn("Réponse inattendue :", json);
                return [];
            }

            // Retourne les personnages extraits
            return json.data as Infographic[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}