export interface IChannels {
	result: IEmoteSet[];
	length: number;
}

export interface IEmoteSet {
	id: string;
	username: string;
	emote_sets: {
		id: string;
		name: string;
		capacity: number;
		emotes: IEmote[];
	};
}

export interface IEmote {
	name: string;
	id: string;
	data: {
		name: string;
		listed: boolean;
	};
}

export interface UserData {
	data: {
		user: {
			id: string;
			emote_sets: {
				id: string;
				name: string;
				capacity: number;
				emotes: IEmote[];
			}[];
			connections: Connections[];
		};
	};
	errors?: Errors[];
}

export interface Connections {
	id: string;
	username: string;
	platform: string;
	emote_set_id: string | null;
}

export interface Errors {
	message: string;
	path: string[];
}

export interface IVR {
	id: string;
	login: string;
	display_name: string;
	length: number;
}

export interface StvRest {
	user: {
		id: string;
	};
	error?: string;
}
