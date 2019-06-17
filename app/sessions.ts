///<reference path="session.ts"/>
import request = require('request');
import {Auth} from "./auth";
import {Session} from "./session";
import {DownloadedSessionScreenshot} from "./sessionInterface";

export class Sessions {
	private httpOptions: any;

	constructor(private endpoint: string, private auth: Auth) {
		this.httpOptions = {
			auth: this.auth,
		}
	}

	logs(predicates: any[]) {
		this.getSessions(predicates, (error: any, res: any, body: any) => this.getLogForSessions(error, res, body));
	}

	screenshots(predicates: any[]) {
		this.getSessions(predicates, (error: any, res: any, body: any) => this.getScreenshotsForSessions(error, res, body));
	}

	getLogForSessions(error: any, response: any, body: any) {
		body = JSON.parse(body.toString());
		for (let session of body.sessions) {
			new Session(this.endpoint, this.httpOptions, session.url).log();
		}
	}

	getScreenshotsForSessions(error: any, response: any, body: any) {
		body = JSON.parse(body.toString());
		for (let session of body.sessions) {
			new Session(this.endpoint, this.httpOptions, session.url).screenshots((download?: DownloadedSessionScreenshot, error?: Error) => {
				if (error) {
					console.log(error);
				} else {
					console.log("Saving " + download!.url + " to " + download!.filePath);
				}
			});
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

		// request.post("https://"+this.endpoint+"/api/1/search/", option, (error, response, body) => this.getLogForSessions(error, response, body));
		request.post("https://" + this.endpoint + "/api/1/search/", option, (error, response, body) => callback(error, response, body));
	}
}