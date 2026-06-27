import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const CREDENTIALS_PATH = path.resolve(
	process.cwd(),
	"credentials",
	"oauth.json",
);

const TOKEN_PATH = path.resolve(process.cwd(), "credentials", "token.json");

export const authorize = async () => {
	const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

	const { client_id, client_secret } = credentials.installed;

	const oauth2Client = new google.auth.OAuth2(
		client_id,
		client_secret,
		"http://localhost",
	);

	// Reuse existing token
	if (fs.existsSync(TOKEN_PATH)) {
		const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));

		oauth2Client.setCredentials(token);

		return oauth2Client;
	}

	// First-time authorization
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES,
		prompt: "consent",
	});

	console.log("\nOpen this URL in your browser:\n");
	console.log(authUrl);

	const rl = readline.createInterface({
		input,
		output,
	});

	const code = await rl.question("\nPaste the authorization code here: ");

	rl.close();

	const { tokens } = await oauth2Client.getToken(code.trim());

	oauth2Client.setCredentials(tokens);

	fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

	console.log("\n✅ Token saved to credentials/token.json");

	return oauth2Client;
};
