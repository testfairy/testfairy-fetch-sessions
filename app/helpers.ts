import * as fs from 'fs';
import { Options, SessionsSearchResponse, SessionSearchData, SessionData } from './models';

const request = require('request');
const NodeRSA = require('node-rsa');

export const getEndpoint = (options: Options) => {
	const endpoint = options.endpoint();
	if (endpoint.indexOf(":") >= 0 || endpoint.indexOf("/") >= 0) {
		throw new Error("Invalid value for option \"endpoint\". Please supply only domain name, for example: \"mycompany.testfairy.com\".");
	}

	return endpoint;
};

export const isEmpty = (obj: Object) => {
	return Object.keys(obj).length === 0;
};

export const getRsaEncryptionKey = (options: Options) => {
	if (!options.contains('rsa-private-key')) {
		return null;
	}

	const rsaPrivateKeyFilePath = options.key('rsa-private-key');
	if (!fs.existsSync(rsaPrivateKeyFilePath)) {
		throw new Error(`RSA private key file (${rsaPrivateKeyFilePath}) does not exist.`);
	}

	const rsaPrivateKey = fs.readFileSync(rsaPrivateKeyFilePath, { encoding: 'utf8' });
	const rsa = new NodeRSA(rsaPrivateKey, 'pkcs1-private-pem', { encryptionScheme: 'pkcs1' });
	return rsa;
};

export const assertNoMissingParams = (options: any, required: string[]) => {
	for (var i = 0; i < required.length; i++) {
		var k = required[i];
		if (!(k in options)) {
			throw new Error("Missing value of option \"" + k + "\"");
		}
	}

	if (!("logs" in options) && !("screenshots" in options) && !("video" in options)) {
		throw new Error("Must provide at least one of --logs, --screenshots or --video");
	}
};

export const makeProjectPredicates = (options: Options) => {
	const predicates = [{
		"type": "number",
		"attribute": "project_id",
		"comparison": "eq",
		"value": options.projectId()
	}];

	if (!options.contains('all-time')) {
		predicates.push({
			"type":"date",
			"attribute":"recorded_at",
			"comparison":"gt",
			"value":"now-24h/h"
		});
	}

	return predicates;
}


const searchSessions = async (predicates: any[], options: Options): Promise<SessionsSearchResponse> => {
	const endpoint = options.key('endpoint');
	const auth = options.auth();
	const url = `https://${endpoint}/api/1/search/`;

	return new Promise((resolve, reject) => {
		const httpOptions = { auth };
		let option = {
			...httpOptions, ...{
				form: {
					"predicates": JSON.stringify(predicates),
					"fields": "url,recorded_at,app_name,app_version,app_version_code,attributes4,device_maker,device_model,ip,os_version,email"
				}
			}
		};

		const callback = (error: any, response: any, body: any) => {
			if (error) {
				reject(error);
			} else {
				try {
					resolve(JSON.parse(body.toString()));
				} catch (exception) {
					reject(exception);
				}
			}
		};
		request.post(url, option, callback);
	});
}

const fetchSessionData = async (session: SessionSearchData, options: Options): Promise<SessionData> => {
	const endpoint = options.key('endpoint');
	const auth = options.auth();
	const url = `https://${endpoint}/api/1${session.url}?fields=events`;

	return new Promise((resolve, reject) => {
		const httpOptions = { auth };
		request.get(url, httpOptions, (error: any, res: any, body: string) => {
			if (error) {
				reject(error);
			} else {
				try {
					const response = JSON.parse(body.toString());
					const data: SessionData = {
						...response.session,
						url: session.url,
						recordedAt: new Date(session.recorded_at),
						appName: session.app_name,
						appVersion: session.app_version,
						appVersionCode: session.app_version_code,
						attributes: session.attributes4,
						userId: session.email,
						deviceMaker: session.device_maker,
						deviceModel: session.device_model,
						ipAddress: session.ip,
						osVersion: session.os_version,
						platform: session.platform == 0 ? "Android" : "iOS",
					};
					resolve(data);
				} catch (exception) {
					reject(exception);
				}
			}
		});
	});
}

export const sessions = async (predicates: any[], options: Options): Promise<SessionData[]> => {
	const sessionData: any = await searchSessions(predicates, options);
	const events = sessionData.sessions.map((session: SessionSearchData) => {
		return fetchSessionData(session, options)
	});

	return Promise.all(events);
}
