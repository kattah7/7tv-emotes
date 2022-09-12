import fetch from 'node-fetch';

export async function UserInfo(username: string) {
    if (!username) return null;
    const Data = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${username}`).then((res) => res.json());
    return Data;
}
