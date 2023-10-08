import fetch from 'node-fetch';
import type { IVR } from '../types/index.js';

export async function IVR(channelName: string): Promise<IVR | null> {
	try {
		const data = (await fetch(`https://api.ivr.fi/v2/twitch/user?login=${channelName}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'IF YOU SEE THIS VI VON ZULUL',
			},
		}).then((res) => res.json())) as IVR[];

		if (!data || data.length === 0) return null;

		return data[0];
	} catch (e) {
		return null;
	}
}
