export type TelegramUser = {
	id: number;
	firstName: string;
	lastName: string;
	languageCode: string;
};

export type TelegramChat = {
	id: number;
	type: string;
	firstName: string;
	lastName: string;
};

export type TelegramMessage = {
	id: number;
	from: TelegramUser;
	chat: TelegramChat;
	createdAt: number;
	text: string;
};

export type TelegramLocation = {
	id: number;
	from: TelegramUser;
	chat: TelegramChat;
	eventLocation: {
		latitude: number;
		longitude: number;
	};
};

export type TelegramCommand = {
	id: number;
	from: TelegramUser;
	chat: TelegramChat;
	entities: [{ type: "bot_command" }];
	text: string;
};

export type TelegramPayload = {
	updateType: "message";
	updateId: number;
	update: {
		update_id: number;
		message: {
			message_id: number;
			from: TelegramUser;
			chat: TelegramChat;
			date: number;
			text: string;
			entities: [{ type: string }];
		};
	};
	payload: {
		message_id: number;
		from: {
			id: number;
			is_bot: boolean;
			first_name: string;
			last_name: string;
			language_code: string;
		};
		chat: {
			id: number;
			first_name: string;
			last_name: string;
			type: string;
		};
		date: number;
		text: string;
		entities: [{ type: string }];
	};
};

export type TelegramOptions = {
	[key: string]: unknown;
};

export type TelegramApi = {
	reply: (message: string, options?: TelegramOptions) => Promise<void>;
	send: (action: string, options?: TelegramOptions) => Promise<void>;
	sendChatAction: (action: string, options?: TelegramOptions) => Promise<void>;
	setLanguage: (language: string) => Promise<void>;
};

export type TelegramContext = TelegramApi &
	(TelegramMessage | TelegramLocation | TelegramCommand);

export type TelegramMessageContext = TelegramApi & TelegramMessage;
export type TelegramLocationContext = TelegramApi & TelegramLocation;
export type TelegramCommandContext = TelegramApi & TelegramCommand;
export type TelegramPayloadContext = TelegramApi & TelegramPayload;
