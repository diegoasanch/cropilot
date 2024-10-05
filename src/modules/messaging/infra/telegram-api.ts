export class TelegramApi {
	constructor(private readonly botToken: string) {}

	async sendMessage(chatId: string, message: string) {
		console.log("Sending message to", chatId, message);
	}
}
