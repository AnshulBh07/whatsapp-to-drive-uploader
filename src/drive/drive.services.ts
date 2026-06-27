import { Readable } from "node:stream";

import { drive_v3 } from "googleapis";

import { getDrive } from "./drive.client";

const dateFolderCache = new Map<string, string>();

export const uploadFile = async ({
	parentFolderId,
	filename,
	mimeType,
	buffer,
}: {
	parentFolderId: string;
	filename: string;
	mimeType: string;
	buffer: Buffer;
}) => {
	const drive = await getDrive();

	const res = await drive.files.create({
		requestBody: {
			name: filename,
			parents: [parentFolderId],
		},
		media: {
			mimeType,
			body: Readable.from(buffer),
		},
		fields: "id,name",
	});

	return res.data;
};

const findFolder = async (
	drive: drive_v3.Drive,
	name: string,
	parentId: string,
) => {
	try {
		const result = await drive.files.list({
			q: [
				`name='${name}'`,
				`'${parentId}' in parents`,
				"mimeType='application/vnd.google-apps.folder'",
				"trashed=false",
			].join(" and "),
			fields: "files(id,name)",
		});

		return result.data.files?.[0] ?? null;
	} catch (err) {
		console.error("Error while finding drive folder:", err);

		throw err;
	}
};

const createFolder = async (
	drive: drive_v3.Drive,
	name: string,
	parentId: string,
) => {
	try {
		const result = await drive.files.create({
			requestBody: {
				name,
				mimeType: "application/vnd.google-apps.folder",
				parents: [parentId],
			},
			fields: "id,name",
		});

		return result.data;
	} catch (err) {
		console.error("Error while creating drive folder:", err);

		throw err;
	}
};

const getOrCreateFolder = async (
	drive: drive_v3.Drive,
	name: string,
	parentId: string,
) => {
	const existing = await findFolder(drive, name, parentId);

	if (existing?.id) {
		return existing.id;
	}

	const created = await createFolder(drive, name, parentId);

	if (!created?.id) {
		throw new Error(`Failed to create folder: ${name}`);
	}

	return created.id;
};

export const uploadToDrive = async ({
	parentFolderId,
	filename,
	mimeType,
	buffer,
}: {
	parentFolderId: string;
	filename: string;
	mimeType: string;
	buffer: Buffer;
}) => {
	try {
		const now = new Date();

		const year = String(now.getFullYear());

		const month = now.toLocaleString("en-US", {
			month: "long",
		});

		const day = now.getDate().toString().padStart(2, "0");

		const dateKey = `${year}/${month}/${day}`;

		const cachedFolderId = dateFolderCache.get(dateKey);

		if (cachedFolderId) {
			return uploadFile({
				parentFolderId: cachedFolderId,
				filename,
				mimeType,
				buffer,
			});
		}

		const drive = await getDrive();

		const yearFolderId = await getOrCreateFolder(drive, year, parentFolderId);

		const monthFolderId = await getOrCreateFolder(drive, month, yearFolderId);

		const dayFolderId = await getOrCreateFolder(drive, day, monthFolderId);

		dateFolderCache.set(dateKey, dayFolderId);

		return uploadFile({
			parentFolderId: dayFolderId,
			filename,
			mimeType,
			buffer,
		});
	} catch (err) {
		console.error("Error while uploading to drive:", err);

		throw err;
	}
};
