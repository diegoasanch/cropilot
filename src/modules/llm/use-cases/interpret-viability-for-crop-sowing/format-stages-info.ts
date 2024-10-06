import { StagedMeasurements } from "@/modules/nasa/utils/group-average-measurements-by-stages.js";
import { InterpretedUserMessage } from "../interpret-user-messages/t-interpret-user-message.js";

// Function to format stages info
export function formatStagesInfo(
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
