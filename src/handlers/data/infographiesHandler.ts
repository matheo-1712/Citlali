import puppeteer, { Browser, Page } from "puppeteer";
import { Infographic } from "../../db/class/Infographic";
import { Character } from "../../db/class/Character";

export const registerInfographicsLink = async (): Promise<void> => {
  let page: Page;
  let browser: Browser | null = null;
  const baseUrl = 'https://keqingmains.com/i/';

  const listBuilds = [
    "freeze", "melt-build", "melt", "melt-dps", "support", "teams", "burgeon-build", "melt-bunny-bomber-dps-build",
    "melt-charged-shot-dps-build", "teams", "bloom", "dps", "support", "mechanics", "quickswap", "support", 
    "c6-aggravate", "hyperbloom", "cryo-dps", "physical-dps", "freeze", "melt", "quadratic-scaling",
    "driver", "sunfire", "electro", "aggravate", "burgeon", "on-field-dps", "nilou-bloom", "off-field-support",
    "on-field-driver", "on-field-dps-build", "c6-dps", "reaction", "off-field", "aggravate", "hyperbloom",
    "on-field", "physical", "transformative", "reverse-melt", "off-field", "on-field", "quicken",
    "burgeon", "freeze-and-mono-cryo-dps", "pyro", "shielder"
  ];

  try {
    // Lancer le navigateur avec désactivation du sandbox
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    const charactersList = await Character.getAll();

    for (const character of charactersList) {
      // Traiter l'infographie "classique"
      const defaultUrl = baseUrl + character.value.toLowerCase() + '/';
      const responseDefault = await fetch(defaultUrl);
      if (responseDefault.status !== 404) {
        await page.goto(defaultUrl, { waitUntil: 'networkidle2' });
        const url = page.url();

        const infographic: Infographic = {
          character: character.name,
          build: 'Classique',
          url: url,
        };

        try {
          if (await Infographic.exists(infographic)) {
            Infographic.update(infographic);
          } else {
            Infographic.add(infographic);
          }
        } catch (error) {
          console.error("Erreur lors de l'enregistrement de l'infographie:", error);
        }
      }

      // Traiter les builds spécifiques
      for (const build of listBuilds) {
        const urlToCheck = baseUrl + character.value.toLowerCase() + '-' + build + '/';
        const response = await fetch(urlToCheck);
        if (response.status !== 404) {
          await page.goto(urlToCheck, { waitUntil: 'networkidle2' });
          const finalUrl = page.url();

          let buildName: string;
          if (build === 'melt-build' || build === 'melt-dps') {
            buildName = 'Melt'; 
          } else if (build === 'on-field-dps-build' || build === 'on-field-dps') {
            buildName = 'On-Field';
          } else {
            buildName = build.charAt(0).toUpperCase() + build.slice(1);
          }

          const infographic: Infographic = {
            character: character.name,
            build: buildName,
            url: finalUrl,
          };

          try {
            if (await Infographic.exists(infographic)) {
              Infographic.update(infographic);
            } else {
              Infographic.add(infographic);
            }
          } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'infographie:", error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'infographie:", error);
  } finally {
    if (browser) await browser.close();
  }
};
