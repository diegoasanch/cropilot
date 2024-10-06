import * as esbuild from "esbuild";

await esbuild.build({
	entryPoints: ["src/index.ts"],
	bundle: true,
	platform: "node",
	target: "node22",
	outfile: "dist/index.mjs",
	format: "esm",
	external: ["pg-native", "fastify", "drizzle-orm", "@fastify/*"],
	banner: {
		js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
	},
});
console.log("Build complete");
