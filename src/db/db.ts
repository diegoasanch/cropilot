import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { env } from "@/env.js";

const { Client } = pkg;

const client = new Client({
	connectionString: env.DATABASE_URL,
});

let dbConnection: DB | null = null;
export async function initDb() {
	if (dbConnection) return dbConnection;

	dbConnection = await connectDb();
	return dbConnection;
}

export async function connectDb() {
	await client.connect();
	return drizzle(client);
}

export type DB = Awaited<ReturnType<typeof connectDb>>;
