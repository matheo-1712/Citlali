"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInfographicsLink = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const db_1 = require("../../db");
const registerInfographicsLink = async () => {
    const baseUrl = 'https://keqingmains.com/i/';
    const listBuilds = [
        "freeze", "melt", "support", "melt-build", "teams", "burgeon-build", "melt-bunny-bomber-dps-build",
        "melt-charged-shot-dps-build", "teams", "bloom", "dps", "support", "mechanics", "quickswap", "support",
        "on-field-dps", "c6-aggravate", "hyperbloom", "cryo-dps", "physical-dps", "freeze", "melt", "quadratic-scaling",
        "driver", "sunfire", "electro", "aggravate", "burgeon", "on-field-dps", "nilou-bloom", "off-field-support",
        "on-field-driver", "on-field-dps-build", "c6-dps", "reaction", "off-field", "aggravate", "hyperbloom",
        "on-field", "physical", "transformative", "reverse-melt", "off-field", "on-field", "quicken",
        "burgeon", "freeze-and-mono-cryo-dps", "melt-dps", "pyro", "shielder"
    ];
    // Lancer le navigateur
    const browser = await puppeteer_1.default.launch({ headless: true });
    const page = await browser.newPage();
    try {
        const charactersList = (0, db_1.getCharactersList)();
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
                const infographic = {
                    character: character.name,
                    build: 'default',
                    url: url,
                };
                try {
                    if (await (0, db_1.userHasInfographic)(character.name, 'default')) {
                        // TODO : Mettre à jour l'infographie
                    }
                    else {
                        (0, db_1.addInfographic)(infographic);
                    }
                }
                catch (error) {
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
                    // Enregistrer l'infographie dans la base de données
                    const infographic = {
                        character: character.name,
                        build: build,
                        url: finalUrl,
                    };
                    try {
                        if (await (0, db_1.userHasInfographic)(character.name, build)) {
                            // TODO : Mettre à jour l'infographie
                        }
                        else {
                            (0, db_1.addInfographic)(infographic);
                        }
                    }
                    catch (error) {
                        console.error("Erreur lors de l'enregistrement de l'infographie:", error);
                    }
                }
            }
        }
        // Fermer le navigateur
        await browser.close();
    }
    catch (error) {
        // Fermer le navigateur en cas d'erreur
        await browser.close();
        console.error("Erreur lors de la récupération de l'infographie:", error);
    }
};
exports.registerInfographicsLink = registerInfographicsLink;
