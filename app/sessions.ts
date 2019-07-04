///<reference path="session.ts"/>
import request = require('request');
import {Auth} from "./auth";
import {Session} from "./session";
import {ScreenshotCallbackCommand} from "./screenshotCallback";

export class Sessions {
	private httpOptions: any;

	constructor(
		private endpoint: string, 
		private rootPath: string,
		private auth: Auth
	) {
		this.httpOptions = {
			auth: this.auth,
		}
	}

	logs(predicates: any[]) {
		this.getSessions(predicates, (error: any, res: any, body: any) => this.getLogForSessions(error, res, body));
	}

	screenshots(predicates: any[], callback: ScreenshotCallbackCommand) {
		this.getSessions(predicates, (error: any, res: any, body: any) => this.getScreenshotsForSessions(error, res, body, callback));
	}

	getLogForSessions(error: any, response: any, body: any) {
		body = JSON.parse(body.toString());
		for (let session of body.sessions) {
			let dirPath = this.rootPath + session.url;
			new Session(this.endpoint, this.httpOptions, session.url, dirPath).log();
		}
	}

	getScreenshotsForSessions(error: any, response: any, body: any, callback: ScreenshotCallbackCommand) {
		body = JSON.parse(body.toString());
		for (let session of body.sessions) {
			let dirPath = this.rootPath + session.url;
			new Session(this.endpoint, this.httpOptions, session.url, dirPath).screenshots(callback);
		}
	}

	private getSessions(predicates: any[], callback: any) {
		let option = {
			...this.httpOptions, ...{
				form: {
					"predicates": JSON.stringify(predicates),
					"fields": "url"
				}
			}
		};
		request.post("https://" + this.endpoint + "/api/1/search/", option, (error, response, body) => callback(error, response, body));
	}
}