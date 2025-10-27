/**
 * Represents a character with specific attributes and properties in a given system.
 *
 * @typedef {Object} CharacterType
 * @property {number} [id] - The unique identifier for the character. This property is optional.
 * @property {string} name - The name of the character.
 * @property {string} weapon - The type of weapon the character uses.
 * @property {string} element - The elemental attribute or power associated with the character.
 * @property {string} region - The region or origin of the character.
 * @property {string} portraitLink - A URL to the character's portrait image.
 * @property {string} formatedValue - A formatted string representing additional information or processed value for the character.
 */
export type CharacterInfosType = {
    id?: number,
    name: string,
    weapon: string,
    element: string,
    region: string,
    portraitLink: string,
    formatedValue: string,
}