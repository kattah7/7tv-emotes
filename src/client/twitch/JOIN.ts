import { client } from '../../utility/connections';
import { Emote } from '../../utility/db';
import { StvInfo, UserInfo } from '../../utility/parseUID';
import { channelEmotes } from '../../utility/channelEmotes';
import * as Logger from '../../utility/logger';

async function JOIN() {
    client.on('JOIN', async ({ channelName }) => {
        Logger.info(`Joined ${channelName}`);
        const userID = (await UserInfo(channelName))[0].id;
        if (!(await Emote.findOne({ id: userID }))) {
            const channelEmote = await channelEmotes(userID);
            if (channelEmote == null) {
                Logger.error(`No emotes found for ${channelName}`);
                return;
            }
            try {
                const newEmote = new Emote({
                    name: channelName.toLowerCase(),
                    id: userID,
                    StvId: (await StvInfo(userID)).user.id,
                    emotes: channelEmote,
                });
                await newEmote.save();
                Logger.warn(`User doesn't exist in DB, adding... ${channelName} emotes`);
            } catch (err) {
                Logger.error(err);
            }
        }
    });
}

export { JOIN };
