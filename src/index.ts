import { initDb } from "./db/db.js";
import { user } from "./db/schema.js";
import { env } from "./env.js";
import { interpretUserMessage } from "./modules/llm/use-cases/interpret-user-messages/interpret-user-message.js";
import { interpretViabilityForCropSowing } from "./modules/llm/use-cases/interpret-viability-for-crop-sowing/interpret-viavility-for-crop-sowing.js";
import { EClimateParameters } from "./modules/nasa/infra/t-temporal-api.js";
import { TemporalApi } from "./modules/nasa/infra/temporal-api.js";
import { queryTemporalData } from "./modules/nasa/use-cases/temporal-query.js";
import { groupAndAverageMeasurementsByStages } from "./modules/nasa/utils/group-average-measurements-by-stages.js";
import Fastify from "fastify";

async function startServer() {
  const db = await initDb();

  const fastify = Fastify({
    logger: true,
  });

  fastify.get("/", (request, reply) => {
    reply.send({ team: "Los Andevelopers", project: "Cropilot" });
  });

  fastify.get("/users", async (request, reply) => {
    const users = await db.select().from(user);
    reply.send(users);
  });
  fastify.get("/temporal", async (request, reply) => {
   // STAGE 1: FORMAT INPUT
    const userMessage =
      "Quiero hacer una siembra de papa el proximo mes de noviembre en estas coordenadas  9.353614 -70.316381";

    const interpretedUserMessage = await interpretUserMessage(userMessage);

    if (!interpretedUserMessage)
      throw new Error("ERROR FORMATTING USER MESSAGE");

    if(interpretedUserMessage.status === "needs_more_info")throw new Error("Message Incomplete: " + interpretedUserMessage.message)
    
    
    
    // STAGE 2: RETRIEVE NASA DATA
    const temporalApi = new TemporalApi(env.TEMPORAL_API_BASE_URL);
    const temporalDataQuery = queryTemporalData(temporalApi);


    const nasaMeasurements = await temporalDataQuery({
      parameters: [
        EClimateParameters.T2M, // Temperature at 2 meters (°C)
        EClimateParameters.TS, // Earth Skin Temperature (°C)
        EClimateParameters.PRECTOTCORR, // Precipitation (mm/day)
        EClimateParameters.QV2M, // Specific Humidity at 2 meters (g/kg)
        EClimateParameters.WS2M, // Wind Speed at 2 meters (m/s)
        EClimateParameters.GWETTOP, // Surface Soil Wetness (1)
        EClimateParameters.GWETROOT, // Root Zone Soil Wetness (1)
        EClimateParameters.GWETPROF, // Profile Soil Moisture (1)
      ],
      latitude: interpretedUserMessage.intention.location.latitude,
      longitude: interpretedUserMessage.intention.location.longitude,
      start: new Date(2000, 1, 1),
      end: new Date(),
      interval: "daily",
    });

    if (!nasaMeasurements) throw new Error("FAILED TO RETRIEVE DATA FROM NASA");

    const stages = interpretedUserMessage.intention.stages;

    const measurementsGroupedByStage = groupAndAverageMeasurementsByStages(
      stages,
      nasaMeasurements
    );

    // STAGE 3: ANSWER
    const answer = await interpretViabilityForCropSowing(
      interpretedUserMessage.intention,
      {
        ...measurementsGroupedByStage,
      }
    );

    reply.send({
      answer,
    });
  });
  fastify.listen({ port: env.PORT }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
