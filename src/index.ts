import Fastify from "fastify";
import { initDb } from "./db/db.js";
import { user } from "./db/schema.js";
import { env } from "./env.js";

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
