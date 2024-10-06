import { Stage } from "@/modules/llm/use-cases/interpret-user-messages/t-interpret-user-message.js";

// Represents the NASA measurements.
interface NasaMeasurements {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    parameter: {
      [key: string]: {
        [date: string]: number;
      };
    };
  };
}

// Represents the averaged measurements grouped by stages.
export interface StagedMeasurements {
  [stageName: string]: {
    averages: {
      [parameter: string]: number;
    };
  };
}

export function groupAndAverageMeasurementsByStages(
  stages: Stage[],
  nasaMeasurements: NasaMeasurements
): StagedMeasurements {
  const { parameter } = nasaMeasurements.properties;
  const stagedMeasurements: StagedMeasurements = {};

  // Convert the date strings to Date objects for easy comparison.
  const dateParameterMap: { [date: string]: { [param: string]: number } } = {};

  for (const param in parameter) {
    for (const dateStr in parameter[param]) {
      if (!dateParameterMap[dateStr]) {
        dateParameterMap[dateStr] = {};
      }
      dateParameterMap[dateStr][param] = parameter[param][dateStr];
    }
  }

  // Process each stage.
  for (const stage of stages) {
    const { stage: stageName, start_month, end_month } = stage;

    // Initialize accumulators for parameters.
    const paramSums: { [param: string]: number } = {};
    const paramCounts: { [param: string]: number } = {};

    // Iterate over the dates and accumulate parameter values within the stage's months.
    for (const dateStr in dateParameterMap) {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6));
      const day = parseInt(dateStr.substring(6, 8));

      // Handle stages that span over the year end (e.g., December to February).
      const isWithinStage = isDateWithinStage(month, start_month, end_month);

      if (isWithinStage) {
        const params = dateParameterMap[dateStr];

        for (const param in params) {
          if (!paramSums[param]) {
            paramSums[param] = 0;
            paramCounts[param] = 0;
          }
          paramSums[param] += params[param];
          paramCounts[param] += 1;
        }
      }
    }

    // Calculate averages for the stage.
    const averages: { [param: string]: number } = {};
    for (const param in paramSums) {
      averages[param] = Number(
        (paramSums[param] / paramCounts[param]).toFixed(2)
      );
    }

    // Add to the staged measurements.
    stagedMeasurements[stageName] = {
      averages,
    };
  }

  return stagedMeasurements;
}

// Helper function to determine if a month is within the stage's month range.
function isDateWithinStage(
  month: number,
  startMonth: number,
  endMonth: number
): boolean {
  if (startMonth <= endMonth) {
    // Example: Start in March (3), end in June (6)
    return month >= startMonth && month <= endMonth;
  } else {
    // Stage spans over the year end. Example: Start in November (11), end in February (2)
    return month >= startMonth || month <= endMonth;
  }
}
