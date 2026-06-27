import { Schema, model } from "mongoose";

const uploadedPrescriptionSchema = new Schema(
	{
		messageId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		driveFileId: {
			type: String,
			required: true,
		},
		filename: {
			type: String,
			required: true,
		},
		sender: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

export const UploadedPrescription = model(
	"UploadedPrescription",
	uploadedPrescriptionSchema,
);
