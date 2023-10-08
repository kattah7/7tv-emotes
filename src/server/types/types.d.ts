export type Config = {
	Postgres: {
		password: string;
		user: string;
		host: string;
		port: number;
		database: string;
	};
	Twitch: {
		username: string;
		oauth: string;
		clientId: string;
		clientSecret: string;
	};
	DEBUG: boolean;
	TRANSFER: boolean;
	API: {
		port: number;
		authKey: string;
	};
	WS: {
		port: number;
	};
	Admins: string[];
};

export type NewEmote = {
	id: string;
	alias: string | null;
	name: string;
};

export type UpdateEmote = {
	dbEmote: string;
	name: string;
	alias: string | null;
	id: string;
	channelId: string;
	channelName: string;
};

export type IChannels = {
	count: number;
	channelsToJoin: string[];
};
