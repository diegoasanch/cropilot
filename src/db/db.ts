import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { env } from "@/env.js";

const { Client } = pkg;

const client = new Client({
	connectionString: env.DATABASE_URL,
});

export async function initDb() {
	await client.connect();
	return drizzle(client);
}
