import http = require('https');
import url = require('url');
import fs = require('fs');
import {DownloadedSessionScreenshot, Options} from "./models";

export class ImageDownloader {
	constructor(private options: Options) {}
	download(download: DownloadedSessionScreenshot, callback:(error?:Error | any) => void) {
		if (download.filePath === null) {
			callback({name: "No file destination", message: "No file destination"});
			return;
		}

		const file = fs.createWriteStream(download.filePath);
		file.on('error', (error) => {
			callback(error);
		});
		file.on('finish', function() {
			callback();
		});

		try {
			const parsedUrl = url.parse(download.url);
			const options: http.RequestOptions = { ...parsedUrl, agent: this.options.agent, rejectUnauthorized: false};
			http.get(options, (res:any) => {
				res.pipe(file);
			}).on('error', (error) => {
				callback(error);
			});
		} catch (error) {
			callback(error);
		}
	}
}
