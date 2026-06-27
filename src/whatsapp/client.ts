import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";

export const createWhatsAppClient = async () => {
	try {
		const { saveCreds, state } = await useMultiFileAuthState("auth");

		const socket = makeWASocket({
			auth: state,
			browser: ["Pharmacy Archiver", "Chrome", "1.0.0"],
		});

		socket.ev.on("creds.update", saveCreds);

		return socket;
	} catch (err) {
		console.error("Error while creating whatsapp client : ", err);
		throw err;
	}
};
