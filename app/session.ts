import * as fs from 'fs';
import request = require('request');
import FileSaver = require('file-saver');
import {ImageDownloader} from "./imageDownloader";

const sprintf = require('sprintf-js').sprintf;

export class Session{
	private dirPath: string;
	private logFilePath: string;

	constructor(private endpoint: string, private httpOptions: any, private url: string) {

		this.dirPath = "testfairy-sessions" + url;
		this.logFilePath = this.dirPath + "/session.log"
	}


	log() {
		if (fs.existsSync(this.logFilePath)) {
			console.log(this.logFilePath + " already exists");
			return;
		}

		fs.mkdirSync(this.dirPath, {recursive: true});
		request.get("https://" + this.endpoint + "/api/1" + this.url + "?fields=logs", this.httpOptions, (error, res, log) => this.saveLogs(error, res, log));
	}

	private saveLogs(error:any, res:any, log:any) {
		fs.writeFileSync(this.dirPath + '/session.log', log);

	}

	screenshots() {
		fs.mkdirSync(this.dirPath, {recursive: true});
		request.get("https://" + this.endpoint + "/api/1" + this.url + "?fields=events", this.httpOptions, (error, res, events) => this.onScreenshotsUrls(error, res, events));
	}

	private formatTimestamp(ts: number): string {
		return sprintf("%07.3f", ts); // 7 includes the point and 3
	}

	private onScreenshotsUrls(error:any, res:any, events:any) {

		events = JSON.parse(events.toString());

		const imageDownloader = new ImageDownloader();
		for (let item of events.session.events.screenshotEvents) {

			let filePath = this.dirPath + "/" + this.formatTimestamp(item.ts) + ".jpg";

			if (fs.existsSync(filePath)) {
				console.log(filePath + " already exists");
				return;
			}

			console.log("Saving " + item.url + " to " + filePath);
			imageDownloader.download(item.url, filePath);

		}
	}
}
