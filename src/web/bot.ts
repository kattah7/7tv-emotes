import fetch from 'node-fetch';
import { bot } from '../../config.json';

const HOSTNAME = `http://localhost:${bot.api}`;

export async function joinChannel(channel: string) {
    const join = await fetch(`${HOSTNAME}/bot/join?username=${channel}`, {
        method: 'POST',
    }).then((res) => res.json());
    return join;
}
