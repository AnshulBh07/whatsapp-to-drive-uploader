import { google } from "googleapis";

import { authorize } from "./oauth";

let drive: ReturnType<typeof google.drive> | null = null;

export const getDrive = async () => {
	if (drive) return drive;

	const auth = await authorize();

	drive = google.drive({
		version: "v3",
		auth,
	});

	console.log(`🟢 Successfully connected to drive...`);
	return drive;
};
