import fetch from 'node-fetch';
import type { IEmoteSet } from '../types/index.js';
import type { UserData } from '../types/index.js';

const GQL = 'https://7tv.io/v3/gql';

export async function GetChannelsGQL(channelIds: string): Promise<IEmoteSet | null> {
	const { data, errors } = (await fetch(GQL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `query GetUsers($id: ObjectID!) {
				user(id: $id) {
				  id
				  username
				  display_name
				  created_at
				  avatar_url
				  emote_sets {
					id
					name
					capacity
					emotes {
					  name
					  id
					  data {
						name
						listed
					  }
					}
				  }
				  connections {
					id
					username
					display_name
					platform
					linked_at
					emote_capacity
					emote_set_id
				  }
				}
			  }`,
			variables: {
				id: channelIds,
			},
		}),
	}).then((res) => res.json())) as UserData;

	if (errors || !data) {
		return null;
	}

	if (channelIds !== data.user.id) {
		return null;
	}

	const { emote_sets, connections } = data.user;
	const findTwitch = connections.find((connection: { platform: string }) => connection.platform === 'TWITCH');
	if (!findTwitch) {
		return null;
	}

	const findEmoteSet = emote_sets.find((emoteSet: { id: string }) => emoteSet.id === findTwitch.emote_set_id);
	if (!findEmoteSet) {
		return null;
	}

	return {
		id: findTwitch.id,
		username: findTwitch.username,
		emote_sets: findEmoteSet,
	};
}

export const GetChannels = async (channelIds: string[]): Promise<IEmoteSet[]> => {
	const promise = channelIds.map((channelId) => GetChannelsGQL(channelId));
	const results = await Promise.all(promise);
	const filtered = results.filter((result) => result !== null) as IEmoteSet[];

	return filtered;
};
