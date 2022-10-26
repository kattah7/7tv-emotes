import WebSocket from 'ws';
import * as Logger from './logger';
import { Emote } from '../utility/db';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const WS = new WebSocket(`wss://events.7tv.io/v3`);
export { WS };
export const StvWS = async () => {
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
    // export function that sends json stringify
    WS.on('open', async (msg: any) => {
        Logger.info('Connected to 7TV', msg);
    });

    WS.on('message', async (data: any) => {
        const { op, t, d } = JSON.parse(data);
        switch (d.type) {
            case 'emote_set.update': {
                const { id: emoteSetID } = d.body;
                const getEmoteSet = await fetch(`https://7tv.io/v3/emote-sets/${emoteSetID}`, {
                    method: 'GET',
                }).then((res) => res.json());

                const { id } = getEmoteSet.owner;

                if (d.body.pulled) {
                    const { old_value } = d.body.pulled[0];
                    const knownEmoteNames = (await Emote.findOne({ StvId: id })).emotes.map(
                        (emote: { emote: string }) => emote.emote
                    );
                    if (knownEmoteNames.includes(old_value.id)) {
                        await Emote.updateOne(
                            { 'StvId': id, 'emotes.emote': old_value.id },
                            { $set: { 'emotes.$.isEmote': false } }
                        );
                    }
                } else if (d.body.pushed) {
                    const { value } = d.body.pushed[0];
                    const knownEmoteNames = (await Emote.findOne({ StvId: id })).emotes.map(
                        (emote: { emote: string }) => emote.emote
                    );
                    const findThatEmoteByStvID = (await Emote.findOne({ StvId: id })).emotes.find(
                        (emote: { emote: string }) => emote.emote === value.id
                    );
                    if (findThatEmoteByStvID) {
                        if (knownEmoteNames.includes(value.id) || findThatEmoteByStvID.name !== value.name) {
                            await Emote.updateOne(
                                { 'StvId': id, 'emotes.emote': value.id },
                                { $set: { 'emotes.$.name': value.name } }
                            );
                        }
                    }
                    if (knownEmoteNames.includes(value.id)) {
                        await Emote.updateOne(
                            { 'StvId': id, 'emotes.emote': value.id },
                            { $set: { 'emotes.$.isEmote': true } }
                        );
                    } else {
                        await Emote.updateOne(
                            { StvId: id },
                            {
                                $push: {
                                    emotes: {
                                        name: value.name,
                                        emote: value.id,
                                        usage: (1 as number) || 0,
                                        isEmote: true,
                                        Date: Date.now(),
                                    },
                                },
                            }
                        );
                    }
                } else if (d.body.updated) {
                    const { value } = d.body.updated[0];
                    const knownEmoteNames = (await Emote.findOne({ StvId: id })).emotes.map(
                        (emote: { emote: string }) => emote.emote
                    );
                    if (knownEmoteNames.includes(value.id)) {
                        await Emote.updateOne(
                            { 'StvId': id, 'emotes.emote': value.id },
                            { $set: { 'emotes.$.name': value.name } }
                        );
                    }
                }

                const { connections } = await fetch(`https://7tv.io/v3/users/${id}`, {
                    method: 'GET',
                }).then((res) => res.json());
                const knownEmoteNames = new Set(
                    (await Emote.findOne({ id: connections[0].id })).emotes
                        .filter((emote) => emote.isEmote === true)
                        .map((emote) => emote.name)
                );
                fs.writeFile(`./src/stats/${connections[0].id}.json`, JSON.stringify([...knownEmoteNames]));
                break;
            }

            case 'user.update': {
                const { value, old_value } = d.body.updated[0].value[0];
                sendWS(36, 'emote_set.update', old_value.id);
                sendWS(35, 'emote_set.update', value.id);
                break;
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
