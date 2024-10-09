import type { OpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import type { MessageContent } from "@langchain/core/messages";
import { SystemMessage } from "@langchain/core/messages";
import type { InterpretedUserMessage } from "../interpret-user-messages/t-interpret-user-message.js";
import type { StagedMeasurements } from "@/modules/nasa/utils/group-average-measurements-by-stages.js";
import { viabilityAnalysisPrompt } from "./promp-template.js";
import { formatStagesInfo } from "./format-stages-info.js";

type ViabilityForCropSowingInput = {
	interpretedUserMessage: InterpretedUserMessage;
	measurementsGroupedByStage: StagedMeasurements;
};

export function interpretViabilityForCropSowing(
	model: OpenAI<ChatOpenAICallOptions>,
): (input: ViabilityForCropSowingInput) => Promise<MessageContent> {
	return async ({ interpretedUserMessage, measurementsGroupedByStage }) => {
		const { crop, language } = interpretedUserMessage;

		const stagesInfo = formatStagesInfo(
			interpretedUserMessage,
			measurementsGroupedByStage,
		);

		const formattedPrompt = await viabilityAnalysisPrompt.format({
			crop,
			language,
			stagesInfo,
		});

		const messages = [new SystemMessage(formattedPrompt)];

		try {
			const response = await model.invoke(messages);
			return response.content.toString() as MessageContent;
		} catch (error) {
			console.error("Error during viability analysis:", error);
			throw error;
		}
	};
}
