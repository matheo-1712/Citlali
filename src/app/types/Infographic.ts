/**
 * Represents the type definition for an infographic object.
 *
 * An object of this type includes information for a specific infographic,
 * such as character, build description, and the relevant URL.
 *
 * Properties:
 * - character: Specifies the identifier or name associated with the infographic character.
 * - build: Provides a textual description or designation of the build associated with the character.
 * - url: Defines the URL linking to the infographic or related resource.
 */
export type InfographicType = {
    character: string,
    build: string,
    url: string,
    source: string,
}