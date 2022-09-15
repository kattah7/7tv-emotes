import fetch from 'node-fetch';

const channelEmotes = async (channel: string) => {
    const res = await fetch(`https://7tv.io/v3/users/twitch/${channel}`).then((res) => res.json());
    const parsed = res.emote_set.emotes.map((emote: { id: string; name: string }) => ({
        name: emote.name,
        emote: emote.id,
        usage: 0,
        isEmote: true,
        Date: Date.now(),
    }));
    return parsed;
};

export { channelEmotes };
