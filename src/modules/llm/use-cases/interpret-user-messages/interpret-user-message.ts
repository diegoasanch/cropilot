import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { OpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import type { UserIntentionResponse } from "./t-interpret-user-message.js";
import { interpretUserMessagePrompt } from "./interpret-user-message-prompt.js";

type InterpretUserMessageInput = {
	userMessage: string;
	chatHistory: Message[];
};

type Message = {
	content: string;
	role: "user" | "system";
};

export function interpretUserMessage(
	model: OpenAI<ChatOpenAICallOptions>,
): (
	input: InterpretUserMessageInput,
) => Promise<UserIntentionResponse | undefined> {
	return async ({ chatHistory, userMessage }) => {
		const formattedPrompt = await interpretUserMessagePrompt.format({
			userMessage,
		});

		const messages = [
			new SystemMessage(formattedPrompt),
			...chatHistory.map((msg) =>
				msg.role === "user"
					? new HumanMessage(msg.content)
					: new SystemMessage(msg.content),
			),
			new HumanMessage(userMessage),
		];
		try {
			const response = await model.invoke(messages);
			const parsedResponse = JSON.parse(
				response.content.toString(),
			) as UserIntentionResponse;

			return parsedResponse;
		} catch (e) {
			console.error(e);
			return undefined;
		}
	};
}
