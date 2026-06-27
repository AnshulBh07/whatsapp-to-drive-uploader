import dotenv from "dotenv";
import { createWhatsAppClient } from "./whatsapp/client";
import { registerEvents } from "./whatsapp/events";
import mongoose from "mongoose";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: envFile });

const main = async () => {
	try {
		console.log(
			"============================================================================",
		);
		console.log("                   Pharmacy Prescription Archiver");
		console.log(
			"============================================================================",
		);

		await mongoose.connect(process.env.ATLAS_URI!);

		console.log("🟢 Connected to mongodb");

		const socket = await createWhatsAppClient();

		registerEvents(socket);

		// const buffer = await readFile("./downloads/test.jpg");

		// await uploadToDrive({
		// 	parentFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!,
		// 	filename: "test.jpg",
		// 	mimeType: "image/jpeg",
		// 	buffer,
		// });
	} catch (err) {
		console.error("error while starting app : ", err);
		process.exit(1);
	}
};

main();
