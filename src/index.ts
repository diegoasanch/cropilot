import Fastify from "fastify";
import { env } from "@/env.js";

const fastify = Fastify({
	logger: true,
});

fastify.get("/", (request, reply) => {
	reply.send({ team: "Los Andevelopers", project: "Cropilot" });
});

fastify.listen({ port: 3000 }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
