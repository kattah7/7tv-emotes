import fetch from 'node-fetch';

export async function getEmotes(userID: string) {
    if (!userID) return null;
    const stvInfo = await fetch(`https://7tv.io/v3/users/twitch/${encodeURIComponent(userID)}`, {
        method: 'GET',
    }).then((res) => res.json());
    if (stvInfo.error) return null;
    return stvInfo;
}
