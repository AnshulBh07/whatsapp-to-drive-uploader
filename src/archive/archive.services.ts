import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const saveImage = async (buffer: Buffer, filename: string) => {
	try {
		const outputDir = path.join(process.cwd(), "downloads");

		await mkdir(outputDir, {
			recursive: true,
		});

		const outputPath = path.join(outputDir, filename);

		await writeFile(outputPath, buffer);

		console.log(`✅ Saved: ${outputPath}`);
	} catch (err) {
		console.error("Error while saving image to disk : ", err);
	}
};
