import { client } from '../../utility/connections';
import { Emote } from '../../utility/db';
import { UserInfo } from '../../utility/parseUID';
import { getEmotes } from '../../utility/rest';
import fs from 'fs/promises';
import * as Logger from '../../utility/logger';

async function JOIN() {
    client.on('JOIN', async ({ channelName }) => {
        Logger.info(`Joined ${channelName}`);
        const { id } = (await UserInfo(channelName))[0];

        const knownEmoteNames = new Set(
            (await Emote.findOne({ id: id })).emotes
                .filter((emote) => emote.isEmote === true)
                .map((emote) => emote.name)
        );

        const emoteUsage = (await Emote.findOne({ id: id })).emotes.filter((emote) => isNaN(emote.usage));
        if (emoteUsage[0]) {
            for (const emote of emoteUsage) {
                await Emote.updateOne(
                    { 'id': id, 'emotes.emote': emote.emote },
                    { $set: { 'emotes.$.usage': 0 } }
                ).exec();
                Logger.info(`Reset usage for ${emote.emote} in ${channelName}`);
            }
        }
        if (knownEmoteNames.size === 0) return;
        await fs.writeFile(`./src/stats/${id}.json`, JSON.stringify([...knownEmoteNames]));

        const { emote_set } = await getEmotes(id);
        if (!emote_set.emotes) return;
        for (const emote of emote_set.emotes) {
            const emoteDB = await Emote.findOne({ id: id }).exec();
            const emoteIDS = emoteDB?.emotes.map((emote) => emote.emote);
            Logger.info(`querying ${emote.name} in ${channelName}`);
            if (emoteDB && emoteIDS?.includes(emote.id)) continue;
            await Emote.findOneAndUpdate(
                { id: id },
                {
                    $push: {
                        emotes: {
                            name: emote.name,
                            emote: emote.id,
                            usage: 1,
                            isEmote: true,
                            Date: Date.now(),
                        },
                    },
                },
                { upsert: true, new: true }
            ).exec();
            const existtingEmoteNames = new Set(
                (await Emote.findOne({ id: id })).emotes
                    .filter((emote) => emote.isEmote === true)
                    .map((emote) => emote.name)
            );
            await fs.writeFile(`./src/stats/${id}.json`, JSON.stringify([...existtingEmoteNames]));
            Logger.info(`Added ${emote.name} to ${channelName}'s emotes`);
        }
    });
}

export { JOIN };
