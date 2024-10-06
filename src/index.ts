import Fastify from "fastify";
import { env } from "@/env.js";
import { queryTemporalData } from "./modules/nasa/use-cases/temporal-query.js";
import {
  TGetWeatherPointDataParams,
  TClimateData,
  TTimeSeriesData,
} from "./modules/nasa/infra/t-temporal-api.js";
import { TemporalApi } from "./modules/nasa/infra/temporal-api.js";
import { average } from "./utils/average.js";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", (request, reply) => {
  reply.send({ team: "Los Andevelopers", project: "Cropilot" });
});

fastify.get("/temporal", async (request, reply) => {
  const temporalApi = new TemporalApi(env.TEMPORAL_API_BASE_URL);
  const temporalDataQuery = queryTemporalData(temporalApi);

  const response = await temporalDataQuery({
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
    latitude: 9.353614,
    longitude: -70.316381,
    start: new Date(1981, 1, 1),
    end: new Date(),
    interval: "daily",
  });
  if (!response) {
    throw new Error("NOT FOUND");
  }
  const filtered = average(
    Object.values(
      temporalApi.filterTimeSeries(response.properties.parameter.GWETPROF, {
        month: "10",
      })
    )
  );

  reply.send(filtered);
});
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
