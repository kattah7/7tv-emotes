import WebSocket from 'ws';
import * as Logger from './logger';
import { Emote, Channels } from '../utility/db';
import { StvInfo } from '../utility/parseUID';

let WS = new WebSocket(`wss://events.7tv.io/v3`);
export { WS };
export const StvWS = async () => {
    // export function that sends json stringify
    WS.on('open', async (msg: any) => {
        Logger.info('Connected to 7TV', msg);
        const channels = await Channels.find({});
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

    WS.on('message', async (data: any) => {
        const { op, t, d } = JSON.parse(data);
        if (d.count === 100) {
            WS.close();
            WS = new WebSocket(`wss://events.7tv.io/v3`);
            StvWS();
        }

        if (d.body) {
            if (d.body.pulled) {
                const knownEmoteNames = (await Emote.findOne({ StvId: d.body.id })).emotes.map(
                    (emote: any) => emote.emote
                );
                if (knownEmoteNames.includes(d.body.pulled[0].old_value.id)) {
                    await Emote.updateOne(
                        { 'StvId': d.body.id, 'emotes.emote': d.body.pulled[0].old_value.id },
                        { $set: { 'emotes.$.isEmote': false } }
                    );
                }
            } else if (d.body.pushed) {
                const knownEmoteNames = (await Emote.findOne({ StvId: d.body.id })).emotes.map(
                    (emote: any) => emote.emote
                );
                const findThatEmoteByStvID = (await Emote.findOne({ StvId: d.body.id })).emotes.find(
                    (emote: any) => emote.emote === d.body.pushed[0].value.id
                );
                if (findThatEmoteByStvID) {
                    if (
                        knownEmoteNames.includes(d.body.pushed[0].value.id) ||
                        findThatEmoteByStvID.name !== d.body.pushed[0].value.name
                    ) {
                        await Emote.updateOne(
                            { 'StvId': d.body.id, 'emotes.emote': d.body.pushed[0].value.id },
                            { $set: { 'emotes.$.name': d.body.pushed[0].value.name } }
                        );
                    }
                }
                if (knownEmoteNames.includes(d.body.pushed[0].value.id)) {
                    await Emote.updateOne(
                        { 'StvId': d.body.id, 'emotes.emote': d.body.pushed[0].value.id },
                        { $set: { 'emotes.$.isEmote': true } }
                    );
                } else {
                    await Emote.updateOne(
                        { StvId: d.body.id },
                        {
                            $push: {
                                emotes: {
                                    name: d.body.pushed[0].value.name,
                                    emote: d.body.pushed[0].value.id,
                                    usage: 0,
                                    isEmote: true,
                                    Date: Date.now(),
                                },
                            },
                        }
                    );
                }
            } else if (d.body.updated) {
                const knownEmoteNames = (await Emote.findOne({ StvId: d.body.id })).emotes.map(
                    (emote: any) => emote.emote
                );
                if (knownEmoteNames.includes(d.body.updated[0].value.id)) {
                    await Emote.updateOne(
                        { 'StvId': d.body.id, 'emotes.emote': d.body.updated[0].value.id },
                        { $set: { 'emotes.$.name': d.body.updated[0].value.name } }
                    );
                }
            }
        }

        setInterval(() => {
            WS.send(
                JSON.stringify({
                    op: 37,
                })
            );
        }, 30 * 1000);
    });

    WS.on('error', (err) => {
        Logger.error(`7TV Socket encountered an error: ${err}`);
        setTimeout(() => {
            StvWS();
        }, 1000);
    });

    return WS;
};
