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

export type TelegramOptions = {
	[key: string]: unknown;
};

export type TelegramApi = {
	reply: (message: string, options?: TelegramOptions) => Promise<void>;
	send: (action: string, options?: TelegramOptions) => Promise<void>;
	sendChatAction: (action: string, options?: TelegramOptions) => Promise<void>;
};

export type TelegramContext = TelegramApi &
	(TelegramMessage | TelegramLocation | TelegramCommand);
