import * as Logger from '../utility/logger';
import { client } from '../utility/connections';
import { Channels, Emote } from '../utility/db';
import { StvInfo } from '../utility/parseUID';
import { channelEmotes } from '../utility/channelEmotes';

async function joinChannels() {
    client.join('altaccountpoggers');
    const channels = await Channels.find({});
    for (const channel of channels) {
        client.join(channel.name);
        if (!(await Emote.findOne({ id: channel.id }))) {
            const channelEmote = await channelEmotes(channel.id);
            try {
                const newEmote = new Emote({
                    name: channel.name,
                    id: channel.id,
                    StvId: (await StvInfo(channel.id)).user.id,
                    emotes: channelEmote,
                });
                await newEmote.save();
            } catch (err) {
                Logger.error(err);
            }
        }
    }
}

export { joinChannels };
