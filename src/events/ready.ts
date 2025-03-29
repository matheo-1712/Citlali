import { ActivityType, Client, Events, PresenceUpdateStatus } from "discord.js";
import { BotEvent } from "../types";

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    execute: (client: Client) => {
        console.log(`Connecté en tant que ${client.user?.tag} 🤖`);

        client?.user?.setActivity({
            type: ActivityType.Custom,
            name: 'customstatus',
            state: `Citlali version : ${process.env.VERSION}`,
        });
        
        client?.user?.setStatus(PresenceUpdateStatus.Online);
    }
}

export default event;