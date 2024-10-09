import i18next from "i18next";
import Backend from "i18next-node-fs-backend";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__dirname);

i18next.use(Backend).init({
	backend: {
		loadPath: path.join(__dirname, "i18n", "locales", "{{lng}}", "{{ns}}.json"),
	},
	fallbackLng: "en",
	preload: ["en", "es"],
	ns: ["common"],
	defaultNS: "common",
	debug: process.env.NODE_ENV === "development",
});

export default i18next;
