import { env } from "@/env.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import type { UserIntentionResponse } from "./t-interpret-user-message.js";
import { interpretUserMessagePrompt } from "./interpret-user-message-prompt.js";

export async function interpretUserMessage(
	userMessage: string,
): Promise<UserIntentionResponse | undefined> {
	const formattedPrompt = await interpretUserMessagePrompt.format({
		userMessage,
	});
	const messages = [
		new SystemMessage(formattedPrompt),
		new HumanMessage(userMessage),
	];
	try {
		const model = new ChatOpenAI({
			model: "gpt-3.5-turbo",
			apiKey: env.OPENAI_API_KEY,
			modelKwargs: {
				response_format: { type: "json_object" },
			},
		});

		const response = await model.invoke(messages);
		const parsedResponse = JSON.parse(
			response.content.toString(),
		) as UserIntentionResponse;

		return parsedResponse;
	} catch (e) {
		console.error(e);
	}
}
