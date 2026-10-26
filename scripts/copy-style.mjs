import { mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir("dist", { recursive: true });
const entry = await readFile("src/styles.css", "utf8");
const imports = [...entry.matchAll(/@import "(.+)";/g)];
const styles = await Promise.all(imports.map(([, path]) => readFile(`src/${path}`, "utf8")));
await writeFile("dist/styles.css", styles.join("\n"));
