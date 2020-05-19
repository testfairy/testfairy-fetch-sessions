import * as fs from 'fs';
import { Options, SessionsUrlResponse, SessionsUrl, SessionData } from './models';

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
	const rsaPrivateKeyFilePath = options.key('rsa-private-key');
	if (!rsaPrivateKeyFilePath) {
		return null;
	}

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
	return [{
		"type": "number",
		"attribute": "project_id",
		"comparison": "eq",
		"value": options.projectId()
	}]
}


const fetchSessionUrls = async (predicates: any[], options: Options): Promise<SessionsUrlResponse> => {
	const endpoint = options.key('endpoint');
	const auth = options.auth();
	const url = `https://${endpoint}/api/1/search/`;

	return new Promise((resolve, reject) => {
		const httpOptions = { auth };
		let option = {
			...httpOptions, ...{
				form: {
					"predicates": JSON.stringify(predicates),
					"fields": "url"
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

const fetchSessionEvents = async (session: SessionsUrl, options: Options): Promise<SessionData> => {
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
					const data: SessionData = {...response.session, url: session.url};
					resolve(data);
				} catch (exception) {
					reject(exception);
				}
			}
		});
	});
}

export const sessions = async (predicates: any[], options: Options): Promise<SessionData[]> => {
	const sessionUrls: any = await fetchSessionUrls(predicates, options);
	let events = sessionUrls.sessions.map((session: SessionsUrl) => {
		return fetchSessionEvents(session, options)
	});

	return Promise.all(events);
}
