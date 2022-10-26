import { client } from '../../utility/connections';
import { Emote } from '../../utility/db';
import { StvInfo, UserInfo } from '../../utility/parseUID';
import { WS } from '../../utility/stv';
import fs from 'fs/promises';
import * as Logger from '../../utility/logger';

async function JOIN() {
    client.on('JOIN', async ({ channelName }) => {
        function sendWS(op: number, type: string, id: string) {
            WS.send(
                JSON.stringify({
                    op: op,
                    d: {
                        type: type,
                        condition: {
                            object_id: id,
                        },
                    },
                })
            );
        }

        Logger.info(`Joined ${channelName}`);
        const { id } = (await UserInfo(channelName))[0];
        const { user, emote_set } = await StvInfo(id);
        if (!user && !emote_set) return;
        sendWS(35, 'user.update', user.id);
        sendWS(35, 'emote_set.update', emote_set.id);

        const knownEmoteNames = new Set(
            (await Emote.findOne({ id: id })).emotes
                .filter((emote) => emote.isEmote === true)
                .map((emote) => emote.name)
        );

        const emoteUsage = (await Emote.findOne({ id: id })).emotes.filter((emote) => isNaN(emote.usage));
        if (emoteUsage[0]) {
            for (const emote of emoteUsage) {
                await Emote.updateOne({ 'id': id, 'emotes.emote': emote.emote }, { $set: { 'emotes.$.usage': 0 } });
                Logger.info(`Reset usage for ${emote.emote} in ${channelName}`);
            }
        }
        if (knownEmoteNames.size === 0) return;
        fs.writeFile(`./src/stats/${id}.json`, JSON.stringify([...knownEmoteNames]));
    });
}

export { JOIN };
