import {ColorResolvable, EmbedBuilder} from "discord.js";

export function setUidEmbed(title: string, color: ColorResolvable) {
    return new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setFooter({
            text: "Citlali - Powered by Citlapi",
        })
        .setTimestamp();
}