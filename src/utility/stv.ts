import WebSocket from 'ws';
import * as Logger from './logger';
import { Emote, Channels } from '../utility/db';
import { StvInfo } from '../utility/parseUID';

export const StvWS = async () => {
    const WS = new WebSocket(`wss://events.7tv.io/v3`);
    WS.on('open', async () => {
        Logger.info('Connected to 7TV');
        const channels = await Channels.find();
        for (const channel of channels) {
            const stvID = (await StvInfo(channel.id)).user.id;
            if (!stvID) continue;
            WS.send(
                JSON.stringify({
                    op: 35,
                    d: {
                        type: 'emote_set.update',
                        condition: {
                            object_id: stvID,
                        },
                    },
                })
            );
        }
    });

    WS.on('message', async (data: string) => {
        const message = JSON.parse(data).d;
        if (message.body) {
            if (message.body.pulled) {
                await Emote.updateOne(
                    { 'StvId': message.body.id, 'emotes.emote': message.body.pulled[0].old_value.id },
                    { $set: { 'emotes.$.isEmote': false } }
                );
            } else if (message.body.pushed) {
                const emoteDB = await Emote.findOne({ StvId: message.body.id });
                const doesEmoteExist = emoteDB?.emotes.find((emote) => emote.emote == message.body.pushed[0].value.id);
                if (!doesEmoteExist) {
                    emoteDB?.emotes.push({
                        name: message.body.pushed[0].value.name,
                        emote: message.body.pushed[0].value.id,
                        usage: 0,
                        isEmote: true,
                        Date: Date.now(),
                    });
                    await emoteDB?.save();
                    return;
                }
                await Emote.updateOne(
                    { 'StvId': message.body.id, 'emotes.emote': message.body.pushed[0].value.id },
                    { $set: { 'emotes.$.isEmote': true } }
                );
            } else if (message.body.updated) {
                await Emote.updateOne(
                    { 'StvId': message.body.id, 'emotes.emote': message.body.updated[0].value.id },
                    { $set: { 'emotes.$.name': message.body.updated[0].value.name } }
                );
            }
        }
    });

    WS.on('close', () => {
        Logger.info('Disconnected from 7TV, reconnecting in 1 second');
        setTimeout(() => {
            StvWS();
        }, 1000);
        // try to reconnect
    });

    WS.on('error', (err) => {
        Logger.error(`7TV Socket encountered an error: ${err}`);
        setTimeout(() => {
            StvWS();
        }, 1000);
    });
};
