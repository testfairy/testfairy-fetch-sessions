import http = require('https');
import fs = require('fs');
import {DownloadedSessionScreenshot} from "./sessionInterface";

export class ImageDownloader {

	download(download: DownloadedSessionScreenshot, callback:(error?:Error) => void) {
		const file = fs.createWriteStream(download.filePath);
		file.on('error', (error) => {
			callback(error);
		});

		try {
			http.get(download.url, (res:any) => {
				res.pipe(file);
				file.on('finish', function() {
					callback();
				});
			}).on('error', (error) => {
				callback(error);
			});
		} catch (error) {
			callback(error);
		}
	}
}
