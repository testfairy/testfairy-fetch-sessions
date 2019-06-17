import http = require('https');
import fs = require('fs');
import {DownloadedSessionScreenshot} from "./sessionInterface";

export class ImageDownloader {

	download(download: DownloadedSessionScreenshot, callback:(error?:Error) => void) {
		const file = fs.createWriteStream(download.filePath);
		try {
			http.get(download.url, (res:any) => {
				res.pipe(file);
				callback();
			});
		} catch (error) {
			callback(error);
		}
	}
}
