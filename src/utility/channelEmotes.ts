import fetch from 'node-fetch';

const channelEmotes = async (channel: any) => {
    const res = await fetch(`https://7tv.io/v3/users/twitch/${channel}`).then((res) => res.json());
    if (!res.emote_set.emotes) return null;
    const parsed = await res.emote_set.emotes.map((emote: { name: any; id: any }) => ({
        name: emote.name,
        emote: emote.id,
        usage: 0,
        isEmote: true,
        Date: Date.now(),
    }));
    return parsed;
};

export { channelEmotes };
