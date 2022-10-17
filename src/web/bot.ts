import fetch from 'node-fetch';
import { bot } from '../../config.json';

const HOSTNAME = `http://localhost:${bot.api}`;

export async function joinChannel(channel: string) {
    const join = await fetch(`${HOSTNAME}/bot/join?username=${channel}`, {
        method: 'POST',
    }).then((res) => res.json());
    return join;
}

const RESTAPI = `http://localhost:${bot.port}`;

export async function getTopEmotes() {
    const topEmotes = await fetch(`${RESTAPI}/top`).then((res) => res.json());
    return topEmotes;
}
