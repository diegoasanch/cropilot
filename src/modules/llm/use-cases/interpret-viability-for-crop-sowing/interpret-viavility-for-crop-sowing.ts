import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  MessageContent,
  SystemMessage,
} from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { env } from "@/env.js";
import { InterpretedUserMessage } from "../interpret-user-messages/t-interpret-user-message.js";
import { StagedMeasurements } from "@/modules/nasa/utils/group-average-measurements-by-stages.js";

// Prompt Template
const viabilityAnalysisPrompt = new PromptTemplate({
  inputVariables: ["crop", "language", "stagesInfo"],
  template: `
You are an expert agronomist.

Analyze the following data to determine if it's a good idea to plant {crop} at the specified time and location. Provide your recommendation in {language}. Your response should start with "Hi! Thanks for using Cropilot" in {language}.

Data:
{stagesInfo}

Consider the following:
- Compare the optimal conditions for each stage with the actual averaged measurements.
- Identify any significant discrepancies.
- Provide a summary of your findings.
- Offer recommendations to the farmer.
- Your answer must contain measurable data
- Avoid using terms hard to understand use human readable terms
- Separate your answer in the different stages and give an specific answer for each term.
- Come up  with a final conclusion. 
- Explain the averaged data comes from the NASA measurements done in that Geolocation since year 2000

Your response should be concise and helpful.
`,
});

// Function to format stages info
function formatStagesInfo(
  interpretedUserMessage: InterpretedUserMessage,
  measurementsGroupedByStage: StagedMeasurements
): string {
  let stagesInfo = "";

  interpretedUserMessage.stages.forEach((stage) => {
    const stageName = stage.stage;
    const optimalConditions = stage.optimal_conditions;
    const measurements = measurementsGroupedByStage[stageName]?.averages;

    stagesInfo += `Stage: ${stageName}\n`;
    stagesInfo += `Duration: From month ${stage.start_month} to ${stage.end_month}\n`;
    stagesInfo += `Optimal Conditions:\n`;
    for (const [param, value] of Object.entries(optimalConditions)) {
      stagesInfo += `  ${param}: ${value}\n`;
    }
    stagesInfo += `Actual Averaged Measurements (Since 2000):\n`;
    if (measurements) {
      for (const [param, value] of Object.entries(measurements)) {
        stagesInfo += `  ${param}: ${value.toFixed(2)}\n`;
      }
    } else {
      stagesInfo += `  No measurements available for this stage.\n`;
    }
    stagesInfo += `\n`;
  });

  return stagesInfo;
}

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
