import Fastify from "fastify";
import { env } from "@/env.js";
import { queryTemporalData } from "./modules/nasa/use-cases/temporal-query.js";

import { TemporalApi } from "./modules/nasa/infra/temporal-api.js";

import { interpretUserMessage } from "./modules/llm/use-cases/interpret-user-messages/interpret-user-message.js";
import { groupAndAverageMeasurementsByStages } from "./modules/nasa/utils/group-average-measurements-by-stages.js";
import { interpretViabilityForCropSowing } from "./modules/llm/use-cases/interpret-viability-for-crop-sowing/interpret-viavility-for-crop-sowing.js";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", (request, reply) => {
  reply.send({ team: "Los Andevelopers", project: "Cropilot" });
});

fastify.get("/temporal", async (request, reply) => {
  const temporalApi = new TemporalApi(env.TEMPORAL_API_BASE_URL);
  const temporalDataQuery = queryTemporalData(temporalApi);

  const userMessage =
    "Quiero hacer una siembra de papa el proximo mes de noviembre en estas coordenadas  9.353614 -70.316381";

  const interpretedUserMessage = await interpretUserMessage(userMessage);

  if (!interpretedUserMessage) throw new Error("ERROR FORMATTING USER MESSAGE");

  const nasaMeasurements = await temporalDataQuery({
    parameters: [
      "T2M", // Temperature at 2 meters (°C)
      "TS", // Earth Skin Temperature (°C)
      "PRECTOTCORR", // Precipitation (mm/day)
      "QV2M", // Specific Humidity at 2 meters (g/kg)
      "WS2M", // Wind Speed at 2 meters (m/s)
      "GWETTOP", // Surface Soil Wetness (1)
      "GWETROOT", // Root Zone Soil Wetness (1)
      "GWETPROF", // Profile Soil Moisture (1)
    ],
    latitude: interpretedUserMessage.location.latitude,
    longitude: interpretedUserMessage.location.longitude,
    start: new Date(2000, 1, 1),
    end: new Date(),
    interval: "daily",
  });

  if (!nasaMeasurements) throw new Error("FAILED TO RETRIEVE DATA FROM NASA");

  const stages = interpretedUserMessage.stages;

  const measurementsGroupedByStage = groupAndAverageMeasurementsByStages(
    stages,
    nasaMeasurements
  );

  const answer = await interpretViabilityForCropSowing(interpretedUserMessage, {
    ...measurementsGroupedByStage,
  });

  reply.send({
    answer,
  });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
