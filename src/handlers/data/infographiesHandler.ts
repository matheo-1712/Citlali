import puppeteer from "puppeteer";
import { addInfographic, characterHasInfographic, getCharactersList, updateInfographic } from "../../db";
import { Infographic } from "../../types";

export const registerInfographicsLink = async (): Promise<void> => {

    const baseUrl = 'https://keqingmains.com/i/'

    const listBuilds = [
        "freeze", "melt-build", "melt", "melt-dps", "support", "teams", "burgeon-build", "melt-bunny-bomber-dps-build",
        "melt-charged-shot-dps-build", "teams", "bloom", "dps", "support", "mechanics", "quickswap", "support", 
        "c6-aggravate", "hyperbloom", "cryo-dps", "physical-dps", "freeze", "melt", "quadratic-scaling",
        "driver", "sunfire", "electro", "aggravate", "burgeon", "on-field-dps", "nilou-bloom", "off-field-support",
        "on-field-driver", "on-field-dps-build", "c6-dps", "reaction", "off-field", "aggravate", "hyperbloom",
        "on-field", "physical", "transformative", "reverse-melt", "off-field", "on-field", "quicken",
        "burgeon", "freeze-and-mono-cryo-dps", "pyro", "shielder"
    ];

    // Lancer le navigateur
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {

        const charactersList = getCharactersList();

        for (const character of charactersList) {

            // Récupérer l'url de l'infographie
            const defaultUrl = baseUrl + character.value.toLowerCase() + '/';

            // Vérifier si le lien est valide et ne renvoie pas une erreur 404 (avec fetch)
            const response = await fetch(defaultUrl);
            if (response.status !== 404) {

                // Ouvrir la page de l'infographie
                await page.goto(defaultUrl, { waitUntil: 'networkidle2' });

                // Récupérer l'url de l'infographie
                const url = page.url();

                // Enregistrer l'infographie dans la base de données
                const infographic: Infographic = {
                    character: character.name,
                    build: 'Classique',
                    url: url,
                }

                try {
                    if (characterHasInfographic(character.name, 'Classique')) {
                        updateInfographic(infographic);
                    } else {
                        addInfographic(infographic);
                    }
                } catch (error) {
                    console.error("Erreur lors de l'enregistrement de l'infographie:", error);
                }
            }

            for (const build of listBuilds) {

                const url = baseUrl + character.value.toLowerCase() + '-' + build + '/';

                // Vérifier si le lien est valide et ne renvoie pas une erreur 404 (avec fetch)
                const response = await fetch(url);
                if (response.status !== 404) {

                    // Aller à l'URL
                    await page.goto(url, { waitUntil: 'networkidle2' });

                    // Obtenir l'URL finale après exécution du JavaScript
                    const finalUrl = page.url(); // Ce sera l'URL finale après redirection

                    // Gestion du nom des builds
                    let buildName : string;

                    if (build === 'melt-build' || build === 'melt-dps') {
                        buildName = 'Melt'; 
                    } else if (build === 'on-field-dps-build' || build === 'on-field-dps') {
                        buildName = 'On-Field';
                    }
                    else {
                        buildName = build.charAt(0).toUpperCase() + build.slice(1);
                    }


                    // Enregistrer l'infographie dans la base de données
                    const infographic: Infographic = {
                        character: character.name,
                        build: buildName,
                        url: finalUrl,
                    }

                    try {
                        if (characterHasInfographic(character.name, buildName)) {
                            updateInfographic(infographic);
                        } else {
                            addInfographic(infographic);
                        }
                    } catch (error) {
                        console.error("Erreur lors de l'enregistrement de l'infographie:", error);
                    }
                }
            }
        }
        // Fermer le navigateur
        await browser.close();
    } catch (error) {
        // Fermer le navigateur en cas d'erreur
        await browser.close();
        console.error("Erreur lors de la récupération de l'infographie:", error);
    }
};