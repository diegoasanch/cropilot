import { env } from "@/env.js";
import {
	ChatOpenAI,
	type ChatOpenAICallOptions,
	type OpenAI,
} from "@langchain/openai";
import { interpretUserMessage } from "./use-cases/interpret-user-messages/interpret-user-message.js";
import { interpretViabilityForCropSowing } from "./use-cases/interpret-viability-for-crop-sowing/interpret-viavility-for-crop-sowing.js";

export type LlmClient = Awaited<ReturnType<typeof getLlmClient>>;

export async function getLlmClient() {
	const model = new ChatOpenAI({
		model: "gpt-4o-mini",
		apiKey: env.OPENAI_API_KEY,
		modelKwargs: {
			response_format: { type: "json_object" },
		},
	}) as unknown as OpenAI<ChatOpenAICallOptions>;

	const viabilityModel = new ChatOpenAI({
		model: "gpt-4",
		apiKey: env.OPENAI_API_KEY,
		temperature: 0.7,
	}) as unknown as OpenAI<ChatOpenAICallOptions>;

	return {
		interpretUserMessage: interpretUserMessage(model),
		interpretViabilityForCropSowing:
			interpretViabilityForCropSowing(viabilityModel),

		model,
		viabilityModel,
	};
}
