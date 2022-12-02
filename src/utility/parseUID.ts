import fetch from 'node-fetch';

export async function UserInfo(username: string) {
    if (!username) return null;
    const Data = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${username}`, {
        method: 'GET',
        headers: {
            'User-Agent': 'IF YOU SEE THIS VI VON ZULUL',
        },
    }).then((res) => res.json());
    if (Data.length === 0) return null;
    return Data;
}

export async function StvInfo(username: string) {
    if (!username) return null;
    const Data = await fetch(`https://7tv.io/v3/users/twitch/${username}`, {
        method: 'GET',
        headers: {
            'User-Agent': 'IF YOU SEE THIS VI VON ZULUL',
        },
    }).then((res) => res.json());
    return Data;
}
