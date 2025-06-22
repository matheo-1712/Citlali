// src/db/class/ApiHandler.ts

import path from "node:path";
import {writeFile} from "node:fs";
import * as fs from "node:fs";

/**
 * This class generates a table of API links based on the provided JSON data.
 *
 * Properties:
 * - alias: A unique identifier or shorthand name for the API link.
 * - route: The URL path associated with the API endpoint.
 * - method: The HTTP method (e.g., GET, POST, PUT, DELETE) for this endpoint.
 * - parameters: A string containing the parameters or query string used in this API call.
 * - comment: Optional additional notes or comments about the API link.
 * - description: Optional detailed description of the API link's purpose or functionality.
 */

export type ApiLink = {
    alias: string;
    route: string;
    method: string;
    parameters: string;
    comment?: string;
    description?: string;
};

/**
 * A handler class for managing API registration and interactions.
 */

export class ApiHandler {

    private static readonly linkFile = path.resolve(__dirname, "../../api-link.json");

    // Enregistrer les liens de l'API
    static async registerApiLink(): Promise<void> {
        try {
            const response = await fetch(process.env.API_ROUTES || '', {});
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonResponse = await response.json();

            if (!jsonResponse.success) {
                throw new Error("La requête API a échoué");
            }

            // Ici on récupère le tableau dans la propriété "data"
            const apiLinks: ApiLink[] = jsonResponse.data.map((item: any) => ({
                alias: item.alias,
                route: item.route,
                method: item.method,
                parameters: item.parameters,
                comment: item.comment,
                description: item.description,
            }));

            try {
                const filePath = path.resolve(this.linkFile);
                fs.writeFileSync(filePath, JSON.stringify(apiLinks, null, 4), "utf8");
                console.log("Enregistrement des liens API effectué avec succès. ✔️");
            } catch (error) {
                console.error("Erreur lors de l'enregistrement :", error);
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des liens API :", error);
        }
    }

    // Récupérer un lien de l'API par son alias
    static async getApiLink(alias: string): Promise<ApiLink | null> {
        try {
            const filePath = path.resolve(this.linkFile);
            const fileContent = fs.readFileSync(filePath, "utf8");
            const apiLinks: ApiLink[] = JSON.parse(fileContent);
            return apiLinks.find((link) => link.alias === alias) || null;
        } catch (error) {
            console.error("Erreur lors de la récupération du lien API :", error);
            return null;
        }
    }
}
