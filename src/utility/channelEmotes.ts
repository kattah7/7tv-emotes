import fetch from 'node-fetch';

const channelEmotes = async (channel: any) => {
    const res = await fetch(`https://7tv.io/v3/users/twitch/${channel}`).then((res) => res.json());
    if (!res.emote_set) return null;
    const parsed = await res?.emote_set.emotes.map((emote: { name: string; id: string }) => ({
        name: emote.name,
        emote: emote.id,
        usage: (1 as number) || 0,
        isEmote: true,
        Date: Date.now(),
    }));
    return parsed;
};

export { channelEmotes };
