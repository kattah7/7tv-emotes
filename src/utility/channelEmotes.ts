import fetch from 'node-fetch';

const channelEmotes = async (channel: string) => {
    const res = await fetch(`https://api.7tv.app/v2/users/${channel}/emotes`).then((res) => res.json());
    const emotes = res.map((emote: { name: string; id: string }) => {
        return {
            name: emote.name,
            emote: `https://cdn.7tv.app/emote/${emote.id}/3x`,
        };
    }, []);
    return emotes;
};

export { channelEmotes };
