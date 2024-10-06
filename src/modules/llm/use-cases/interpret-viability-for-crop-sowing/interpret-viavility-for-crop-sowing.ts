import { ChatOpenAI } from "@langchain/openai";
import { MessageContent, SystemMessage } from "@langchain/core/messages";
import { env } from "@/env.js";
import { InterpretedUserMessage } from "../interpret-user-messages/t-interpret-user-message.js";
import { StagedMeasurements } from "@/modules/nasa/utils/group-average-measurements-by-stages.js";
import { viabilityAnalysisPrompt } from "./promp-template.js";
import { formatStagesInfo } from "./format-stages-info.js";

// Main Function
export async function interpretViabilityForCropSowing(
  interpretedUserMessage: InterpretedUserMessage,
  measurementsGroupedByStage: StagedMeasurements
): Promise<MessageContent> {
  const { crop, language } = interpretedUserMessage;

  const stagesInfo = formatStagesInfo(
    interpretedUserMessage,
    measurementsGroupedByStage
  );

  const formattedPrompt = await viabilityAnalysisPrompt.format({
    crop,
    language,
    stagesInfo,
  });

  const messages = [new SystemMessage(formattedPrompt)];

  try {
    const model = new ChatOpenAI({
      model: "gpt-4",
      apiKey: env.OPENAI_API_KEY,
      temperature: 0.7,
    });

    const response = await model.invoke(messages);

    console.log(response.content);

    return response.content;
  } catch (error) {
    console.error("Error during viability analysis:", error);
    throw error;
  }
}
