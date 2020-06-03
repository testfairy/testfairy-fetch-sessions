import * as fs from 'fs';

import { Options, SessionData, AesKeyMeta } from "./models";
import { getRsaEncryptionKey } from "./helpers";
import { AESEncryption } from './aes-encryption';

const sprintf = require('sprintf-js').sprintf;

const save = (log: string | null, logFilePath: string, dirPath: string) => {
	if (log == null) { return; }
	fs.mkdirSync(dirPath, {recursive: true});
	console.log(`Saving session log to ${logFilePath}`);
	fs.writeFileSync(logFilePath, log);
}

const convert = (data: SessionData, rsa: any, options: Options): string | null => {
	if (!data || !data.events) { return null; }

	let logs = data.events.encryptedLogs || data.events.logs || [];
	const key = data.events.meta.find(meta => meta.type === 28);
	if (data.events.encryptedLogs && rsa && key) {
		const aesKey = key as AesKeyMeta;
		const keyDecrypt = rsa.decrypt(aesKey.aesKey, "utf8");
		const ivDecrypt = rsa.decrypt(aesKey.aesIv, "utf8");
		const aes = new AESEncryption(keyDecrypt, ivDecrypt);

		logs.forEach(log => log.text = aes.decryptString(log.text));
	}

	let logPrefix = "";
	if (options.contains("prepend-attributes")) {
		const attributes: any = {};
		data.events.meta
			.filter(meta => meta.type === 20)
			.forEach((attribute: any) => {
				Object.keys(attribute)
					.filter(key => ["ts", "type"].indexOf(key) < 0)
					.forEach((key) => {
						attributes[key] = attribute[key];
					});
			});

		const metadata = {
			"user.id": data.userId,
			"session.timestamp": data.recordedAt.toISOString(),
			"session.url": `https://${options.endpoint()}${data.url}`,
			"session.ipAddress": data.ipAddress,
			"device.os": data.platform,
			"device.model": data.deviceModel,
			"device.osVersion": data.osVersion,
			"app.name": data.appName,
			"app.version": data.appVersion,
			...attributes,
		}
		logPrefix = `${JSON.stringify(metadata)} `;
	}

	const output = logs.map(log => {
		const logTs = Math.max(0, log.ts);
		const recordedAt = new Date(data.recordedAt);
		recordedAt.setTime(data.recordedAt.getTime() + logTs);
		const mmss = recordedAt.toISOString();
		return `${logPrefix}${mmss} ${log.level}/${log.tag}: ${log.text}`.trim();
	}).join("\n");
	return output;
}

export const logs = async (sessions: SessionData[], options: Options) => {
	const rootPath = "testfairy-sessions";
	const encrypt = getRsaEncryptionKey(options);

	sessions.forEach(session => {
		const dirPath = rootPath + session.url;
		const logFilePath = `${dirPath}/session.log`;

		if (fs.existsSync(logFilePath)) {
			console.log(logFilePath + " already exists");
			// fs.unlinkSync(logFilePath);
			return;
		}

		const logs = convert(session, encrypt, options);
		save(logs, logFilePath, dirPath);
	});
}
