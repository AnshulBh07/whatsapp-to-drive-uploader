import {
	downloadMediaMessage,
	type WAMessage,
	type WASocket,
} from "@whiskeysockets/baileys";

export const downloadMedia = async (
	socket: WASocket,
	message: WAMessage,
): Promise<Buffer> => {
	const buffer = await downloadMediaMessage(
		message,
		"buffer",
		{},
		{
			logger: socket.logger,
			reuploadRequest: socket.updateMediaMessage,
		},
	);

	if (!buffer) {
		throw new Error("Failed to download media.");
	}

	return buffer as Buffer;
};
