import { SessionData, Options, ScreenshotEvent, DownloadedSessionScreenshot } from "./models";
import { NoOp, Video, ScreenshotCallbackCommand } from "./screenshotCallback";
import * as fs from 'fs';
import { ImageDownloader } from "./imageDownloader";

const sprintf = require('sprintf-js').sprintf;

const formatTimestamp = (ts: number): string => {
	return sprintf("%07.3f", ts); // 7 includes the point and 3
};

const downloadImage = (data: DownloadedSessionScreenshot): Promise<DownloadedSessionScreenshot> => {
	return new Promise((resolve, reject) => {
		if (fs.existsSync(data.filePath)) {
			console.log(data.filePath + " already exists");
			resolve(data);
		} else {
			const imageDownloader = new ImageDownloader();
			imageDownloader.download(data, (error) => {
				if (error) {
					reject(error);
				} else {
					resolve(data);
				}
			});
		}
	});
};

const downloadImages = (data: SessionData, callback: ScreenshotCallbackCommand) => {
	if (!data || !data.events) { return Promise.resolve([]); }
	const events = data.events.screenshotEvents || [];
	const rootPath = "testfairy-sessions";
	const dirPath = rootPath + data.url;
	fs.mkdirSync(dirPath, {recursive: true});

	const downloads = events.map((event: ScreenshotEvent, index: number) => {
		const filePath = dirPath + "/" + formatTimestamp(event.ts) + ".jpg";
		const download: DownloadedSessionScreenshot = {
			id: data.id,
			session: data.url,
			url: event.url,
			timestamp: event.ts,
			filePath: filePath,
			imageIndex: index,
			totalImages: events.length
		};

		return downloadImage(download)
			.then((item: DownloadedSessionScreenshot) => callback.onDownload(item))
			.catch((error: Error) => callback.onDownload(undefined, error));
	});

	return Promise.all(downloads);
}
export const screenshots = async (sessions: SessionData[], options: Options) => {
	const callback = options.contains('video') ? new Video() : new NoOp();
	const downloads = sessions
		.map(session => downloadImages(session, callback)).filter(promise => promise != null);

	await Promise.all(downloads);
}
