import * as fs from 'fs';
import request = require('request');
import FileSaver = require('file-saver');
import {ImageDownloader} from "./imageDownloader";


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

	screenshots() {

		fs.mkdirSync("res" + this.url, {recursive: true});
		request.get("https://" + this.endpoint + "/api/1" + this.url + "?fields=events", this.httpOptions, (error, res, events) => this.onScreenshotsUrls(error, res, events));
	}

	private onScreenshotsUrls(error:any, res:any, events:any) {


		events = JSON.parse(events.toString());

		const imageDownloader = new ImageDownloader();
		for (let item of events.session.events.screenshotEvents) {

			let filePath = this.dirPath + "/" + item.ts + ".jpg";

			if (fs.existsSync(filePath)) {
				console.log(filePath + " is already exist");
				return;
			}

			console.log("Saving " + item.url + " to " + filePath);
			imageDownloader.download(item.url, filePath);

		}
	}
}
