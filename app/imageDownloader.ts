import http = require('https');
import fs = require('fs');
export class ImageDownloader {

	download(imageUrl: string, path: string) {
		const file = fs.createWriteStream(path);
		try {
			http.get(imageUrl, (res:any) => res.pipe(file));
		} catch (error) {
			console.dir(error)
		}

	}
}
