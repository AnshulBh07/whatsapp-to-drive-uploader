import { WASocket } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import dotenv from "dotenv";
import { downloadMedia } from "./media";
import { UploadedPrescription } from "../models/uploadedPrescription";
import { uploadToDrive } from "../drive/drive.services";
import { createWhatsAppClient } from "./client";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: envFile });

let reconnecting = false;

const reconnect = async () => {
	const socket = await createWhatsAppClient();
	registerEvents(socket);
};

export const registerEvents = (socket: WASocket) => {
	socket.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
		if (qr) {
			console.log("📱 Scan this QR with WhatsApp:");
			qrcode.generate(qr, { small: true });
		}

		switch (connection) {
			case "connecting":
				console.log("🟡 Connecting...");
				break;

			case "open":
				console.log("🟢 Connected!", new Date().toISOString());
				reconnecting = false;
				break;

			case "close":
				console.log("🔴 Connection closed", new Date().toISOString());
				console.dir(lastDisconnect, { depth: null });

				if (reconnecting) return;

				reconnecting = true;

				void (async () => {
					let attempt = 1;

					while (reconnecting) {
						try {
							console.log(`🔄 Reconnect attempt ${attempt}...`);
							await reconnect();
							break;
						} catch (err) {
							console.error(`❌ Reconnect attempt ${attempt} failed`, err);
							attempt++;
							await new Promise((resolve) => setTimeout(resolve, 5000));
						}
					}
				})();

				break;
		}
	});

	socket.ev.on("messages.upsert", async ({ messages, type }) => {
		if (type !== "notify") return;

		for (const msg of messages) {
			try {
				if (msg.key.remoteJid !== process.env.PRESCRIPTION_GROUP_ID) continue;

				if (!msg.message?.imageMessage) continue;

				// check if it is a duplicate with mongodb check
				const pres = await UploadedPrescription.findOne({
					messageId: msg.key.id,
				});

				if (pres) continue;

				// create image buffer
				const buffer = await downloadMedia(socket, msg);

				const timestamp = msg.messageTimestamp
					? Number(msg.messageTimestamp) * 1000
					: Date.now();

				const fileName = `prescription_${timestamp}_${msg.key.id}.jpg`;

				// upload it to drive
				const uploaded = await uploadToDrive({
					parentFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!,
					filename: fileName,
					mimeType: "image/jpeg",
					buffer,
				});

				await UploadedPrescription.create({
					messageId: msg.key.id!,
					driveFileId: uploaded.id!,
					filename: fileName,
					sender: msg.key.participant,
				});

				// await saveImage(buffer, fileName);
				// console.log({
				// 	chat: msg.key.remoteJid,
				// 	fromMe: msg.key.fromMe,
				// 	participant: msg.key.participant,
				// 	message: msg.message,
				// });
			} catch (err) {
				console.error("❌ Failed processing message : ", msg.key.id, err);
			}
		}
	});
};
