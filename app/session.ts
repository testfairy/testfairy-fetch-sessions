import * as fs from 'fs';
import request = require('request');

export class Session{
	private dirPath: string;
	private logFilePath: string;

	constructor(private endpoint: string, private httpOptions: any, private url: string) {

		this.dirPath = "res" + url;
		this.logFilePath = this.dirPath + "/session.log"
	}


	log() {
		if (fs.existsSync(this.logFilePath)) {
			console.log(this.logFilePath + " is already exist");
			return;
		}

		fs.mkdirSync("res" + this.url, {recursive: true});
		request.get("https://" + this.endpoint + "/api/1" + this.url + "?fields=logs", this.httpOptions, (error, res, log) => this.saveLogs(error, res, log));
	}

	private saveLogs(error:any, res:any, log:any) {
		fs.writeFileSync("res" + this.url + '/session.log', log);

	}
}