export type TelegramMessage = {
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
};

export class TelegramApi {
	constructor(private readonly botToken: string) {}

	async sendMessage(chatId: string, message: string) {
		console.log("Sending message to", chatId, message);
	}
}

export function processTelegramMessage(message: TelegramMessage) {
	// Process the message
	console.log(
		`Received message: ${message.text} from ${message.from.first_name}`,
	);
}
