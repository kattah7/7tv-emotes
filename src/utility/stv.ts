import EventSource from 'eventsource';
import * as Logger from './logger';
import { Emote, Channels } from '../utility/db';

const Stv = async () => {
    const channels = await Channels.find();
    const channelsMapped = channels.map((channel) => channel.name);
    const sevenEvents = new EventSource(`https://events.7tv.app/v1/channel-emotes?channel=${channelsMapped}`);

    sevenEvents.addEventListener('ready', (e: { data: string }) => {
        Logger.info('Ready', e.data);
    });

    sevenEvents.addEventListener('update', async (e: { data: string }) => {
        const { action, name, actor, channel, emote, emote_id } = JSON.parse(e.data);
        const userDB = await Emote.findOne({ name: channel });
        const emoteDB = userDB?.emotes.find(
            (e: { name: string; emote: string; usage: number }) => e.emote === emote_id
        );
        switch (action) {
            case 'ADD': {
                if (!emoteDB) {
                    userDB?.emotes.push({
                        name: name,
                        emote: emote_id,
                        usage: 0,
                        isEmote: true,
                        Date: Date.now(),
                    });
                    await userDB?.save();
                } else {
                    const updateIsEmote = userDB?.emotes.find((emote) => emote.emote == emote_id);
                    updateIsEmote.isEmote = true;
                    await userDB?.save();
                }
                Logger.info(`Added 7tv emote, ${name} by ${actor} in ${channel}`);
                break;
            }
            case 'REMOVE': {
                if (emoteDB) {
                    const updateIsEmote = userDB?.emotes.find((emote) => emote.emote == emote_id);
                    updateIsEmote.isEmote = false;
                    await userDB?.save();
                }
                Logger.info(`Removed 7tv + ${name} by ${actor} in ${channel}`);
                break;
            }
            case 'UPDATE': {
                if (emoteDB.emote == emote_id || emoteDB.name != name) {
                    const updateEmote = userDB?.emotes.find((emote) => emote.emote == emote_id);
                    updateEmote.name = name;
                    await userDB?.save();
                }
                Logger.info(`Updated 7tv emote, ${emote.name} to ${name} by ${actor} in ${channel}`);
                break;
            }
        }
    });
};

export { Stv };
