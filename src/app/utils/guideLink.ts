/**
 * Génère les liens vers les guides rapide et complet pour un personnage donné.
 *
 * Cette fonction construit les URLs des guides rapide et complet pour le personnage
 * spécifié, puis vérifie leur accessibilité. Elle retourne un objet contenant
 * les informations sur la disponibilité des guides ainsi que leurs URLs.
 *
 * @param {string} character - Le nom du personnage pour lequel générer les liens.
 * @returns {Promise<{
 *     quickGuide: boolean,
 *     quickGuideUrl: string,
 *     fullGuide: boolean,
 *     fullGuideUrl: string
 * }>} - Une promesse qui résout vers un objet contenant :
 * - `quickGuide` : un booléen indiquant si le guide rapide est disponible.
 * - `quickGuideUrl` : l'URL du guide rapide.
 * - `fullGuide` : un booléen indiquant si le guide complet est disponible.
 * - `fullGuideUrl` : l'URL du guide complet.
 */
export async function getGuideLink(character: string): Promise<{
    quickGuide: boolean;
    quickGuideUrl: string;
    fullGuide: boolean;
    fullGuideUrl: string;
}> {
    const urlQuick = `https://keqingmains.com/q/${character.toLowerCase()}-quickguide`;
    const urlFull = `https://keqingmains.com/${character.toLowerCase()}`;

    // Vérifie si une URL est accessible (status 200 et pas 404)
    async function exists(url: string): Promise<boolean> {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            return res.ok && res.status !== 404;
        } catch {
            return false;
        }
    }

    const [quickGuide, fullGuide] = await Promise.all([
        exists(urlQuick),
        exists(urlFull)
    ]);

    return { quickGuide, quickGuideUrl: urlQuick, fullGuide, fullGuideUrl: urlFull  };
}