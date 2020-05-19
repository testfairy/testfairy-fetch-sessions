import http = require('https');
import fs = require('fs');
import {DownloadedSessionScreenshot} from "./models";

export class ImageDownloader {

	download(download: DownloadedSessionScreenshot, callback:(error?:Error) => void) {
		const file = fs.createWriteStream(download.filePath);
		file.on('error', (error) => {
			callback(error);
		});
		file.on('finish', function() {
			callback();
		});

		try {
			http.get(download.url, (res:any) => {
				res.pipe(file);
			}).on('error', (error) => {
				callback(error);
			});
		} catch (error) {
			callback(error);
		}
	}
}
