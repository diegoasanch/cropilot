import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    TEMPORAL_API_BASE_URL: z.string().url(),
    OPENAI_API_KEY: z.string(),
    PORT: z.string().transform((val) => Number.parseInt(val)),
  },
  clientPrefix: "PUBLIC_",
  client: {},
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
