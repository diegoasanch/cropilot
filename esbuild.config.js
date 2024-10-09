import * as esbuild from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const buildI18n = async () => {
	const locales = ["en", "es"];
	for (const locale of locales) {
		const srcPath = path.join("src", "i18n", "locales", locale, "common.json");
		const destDir = path.join("dist", "i18n", "locales", locale);
		const destPath = path.join(destDir, "common.json");

		await mkdir(destDir, { recursive: true });
		await copyFile(srcPath, destPath);
	}
	console.log("i18n files copied");
};

await esbuild.build({
	entryPoints: ["src/index.ts"],
	bundle: true,
	platform: "node",
	target: "node20",
	sourcemap: true,
	outfile: "dist/index.mjs",
	format: "esm",
	external: ["pg-native", "fastify", "drizzle-orm", "@fastify/*"],
	banner: {
		js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
	},
});

await buildI18n();

console.log("Build complete");
