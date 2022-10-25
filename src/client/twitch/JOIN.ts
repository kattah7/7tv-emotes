import { client } from '../../utility/connections';
import { Emote } from '../../utility/db';
import { StvInfo, UserInfo } from '../../utility/parseUID';
import { channelEmotes } from '../../utility/channelEmotes';
import fs from 'fs/promises';
import * as Logger from '../../utility/logger';

async function JOIN() {
    client.on('JOIN', async ({ channelName }) => {
        Logger.info(`Joined ${channelName}`);
        const userID = (await UserInfo(channelName))[0].id;
        const knownEmoteNames = new Set(
            (await Emote.findOne({ id: userID })).emotes
                .filter((emote) => emote.isEmote === true)
                .map((emote) => emote.name)
        );
        fs.writeFile(`./src/stats/${userID}.json`, JSON.stringify([...knownEmoteNames]));
        Logger.info(`Wrote ${knownEmoteNames.size} emotes to ${userID}.json`);
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
