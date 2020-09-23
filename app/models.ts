import { isEmpty, assertNoMissingParams } from "./helpers";
import http = require('https');

const commandline_args = require('command-line-args');

export interface Auth {
	user: string;
	pass: string;
}

export interface SessionSearchData {
	url: string;
	app_name: string;
	app_version: string;
	app_version_code: string;
	attributes4: string[];
	email: string;
	device_maker: string;
	device_model: string;
	ip: string;
	os_version: string;
	platform: number;
	recorded_at: string;
}

export interface SessionsSearchResponse {
	total_count: number;
	sessions: SessionSearchData[];
}

export interface SessionInterface {
	url: string;
	email: string;
}

export interface SessionsResponse {
	total_count: number;
	sessions: SessionInterface[];
}

export interface DownloadedSessionScreenshot {
	id: number
	session: string,
	url: string,
	timestamp: number,
	filePath: string,
	imageIndex: number
	totalImages: number
}

export interface Meta {
	type: number;
	ts: number;
}

export interface AesKeyMeta extends Meta {
	aesIv: string;
	aesKey: string;
	version: number;
}

export interface Log {
	tag: string;
	text: string;
	ts: number;
	level: string;
}

export interface ScreenshotEvent {
	ts: number;
	url: string;
}

export interface SessionEvents {
	logs: Log[];
	encryptedLogs: Log[];
	meta: Meta[];
	screenshotEvents: ScreenshotEvent[];
}

export interface SessionData {
	id: number;
	url: string;
	events: SessionEvents;
	recordedAt: Date;
	appName: string;
	appVersion: string;
	appVersionCode: string;
	attributes: string[];
	deviceMaker: string;
	deviceModel: string;
	ipAddress: string;
	osVersion: string;
	platform: string;
	userId: string;
}

export interface Predicate {
	type: string,
	attribute: string,
	comparison: string,
	value: string
}

export class Options {
	private options: any;
	public agent: http.Agent;

	constructor(definitions: any[]) {
		this.options = commandline_args(definitions);
		this.agent = new http.Agent({ maxSockets: 5, keepAlive: true });
	}

	containsHelp() {
		return isEmpty(this.options) || this.options.help;
	}

	contains(key: string) {
		return this.options[key] !== undefined
	}

	key(name: string) {
		assertNoMissingParams(this.options, [name]);
		return this.options[name];
	}

	auth() {
		const auth: Auth = {
			"user": this.key("user"),
			"pass": this.key("api-key")
		};

		return auth;
	}

	endpoint() {
		return this.key('endpoint');
	}

	projectId() {
		return this.key('project-id');
	}
}
