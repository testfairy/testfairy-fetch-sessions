import { isEmpty, assertNoMissingParams } from "./helpers";

const commandline_args = require('command-line-args');

export interface Auth {
	user: string;
	pass: string
}

export interface SessionsUrl {
	url: string;
}

export interface SessionsUrlResponse {
	total_count: number;
	sessions: SessionsUrl[];
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
}

export interface Predicate {
	type: string,
	attribute: string,
	comparison: string,
	value: string
}

export class Options {
	private options: any;
	constructor(definitions: any[]) {
		this.options = commandline_args(definitions);
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
