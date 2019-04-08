///<reference path="session.ts"/>
import * as fs from 'fs';
import request = require('request');
import url = require('url');
import {Session} from "./session";
import {Auth} from "./auth";


export class Sessions {
	private httpOptions: any;

	constructor(private endpoint: string, private projectId: number, private auth: Auth) {
		this.httpOptions = {
			auth: this.auth,
		}
	}
	
	logs() {
		
		this.getSessions((error:any, res:any, body:any) => this.getLogForSessions(error, res, body));
	}

	screenshots() {

		this.getSessions((error:any, res:any, body:any) => this.getScreenshotsForSessions(error, res, body));
	}

	getLogForSessions(error: any, response: any, body: any) {
		
		body = JSON.parse(body.toString());
		for ( let session of body.sessions) {
			new Session(this.endpoint, this.httpOptions, session.url).log();
		}
	}

	getScreenshotsForSessions(error: any, response: any, body: any) {

		body = JSON.parse(body.toString());
		for ( let session of body.sessions) {
			new Session(this.endpoint, this.httpOptions, session.url).screenshots();
		}
	}

	private getSessions(callback:any) {

		var predicates = [
			{
				"type": "number",
				"attribute": "project_id",
				"comparison": "eq",
				"value": this.projectId
			}
		];

		let option =  {...this.httpOptions, ...{
			form:  {
				"predicates": JSON.stringify(predicates),
				"fields": "url"
			}}};

		// request.post("https://"+this.endpoint+"/api/1/search/", option, (error, response, body) => this.getLogForSessions(error, response, body));
		request.post("https://"+this.endpoint+"/api/1/search/", option, (error, response, body) => callback(error, response, body));
	}
}