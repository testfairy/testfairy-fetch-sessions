import { SessionData, Options, ScreenshotEvent, DownloadedSessionScreenshot } from "./models";
import { NoOp, Video, ScreenshotCallbackCommand } from "./screenshotCallback";
import * as fs from 'fs';
import { ImageDownloader } from "./imageDownloader";

const sprintf = require('sprintf-js').sprintf;

const formatTimestamp = (ts: number): string => {
	return sprintf("%07.3f", ts); // 7 includes the point and 3
};

const downloadImage = (data: DownloadedSessionScreenshot, options: Options): Promise<DownloadedSessionScreenshot> => {
	return new Promise((resolve, reject) => {
		if (data.filePath === null) {
			console.log(data.id + " has no destination file");
			resolve(data);
		} else if (data.filePath !== null && fs.existsSync(data.filePath)) {
			console.log(data.filePath + " already exists");
			resolve(data);
		} else {
			const imageDownloader = new ImageDownloader(options);
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

const downloadImages = async (data: SessionData, options: Options) => {
	if (!data || !data.events) { return Promise.resolve([]); }
	const screenshots = data.events.screenshotEvents || [];
	const rootPath = "testfairy-sessions";
	const dirPath = rootPath + data.url;
	fs.mkdirSync(dirPath, {recursive: true});

	const downloads = screenshots.map(async (event: ScreenshotEvent, index: number) => {
		const filePath = dirPath + "/" + formatTimestamp(event.ts) + ".jpg";
		const download: DownloadedSessionScreenshot = {
			id: data.id,
			session: data.url,
			url: event.url,
			timestamp: event.ts,
			filePath: filePath,
			imageIndex: index,
			totalImages: screenshots.length,
			width: event.w,
			height: event.h,
		};

		try {
			await downloadImage(download, options);
		} catch {
			console.log(`Failed to download screenshot ${index} from session ${data.id}`);
			download.filePath = null;
		}

		return download;
	});

	return Promise.all(downloads);
}

export const screenshots = async (sessions: SessionData[], options: Options) => {
	const callback = options.contains('video') ? new Video(options) : new NoOp();
	const downloads = sessions
		.map(async (session) => {
			const downloaded = await downloadImages(session, options);
			return {downloaded, session};
		})
		.map(async (promise) => {
			const {downloaded, session} = await promise;
			return await callback.onDownload(downloaded, session);
		})

	await Promise.all(downloads);
}
