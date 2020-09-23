import * as path from "path";
import * as exec from "child_process";
import * as fs from 'fs';

import {DownloadedSessionScreenshot} from "./models";

const ffmpeg = require('ffmpeg-static');

export interface ScreenshotCallbackCommand {
	onDownload(download?: DownloadedSessionScreenshot, error?: Error): void;
}

export class NoOp implements ScreenshotCallbackCommand {
	public onDownload(download?: DownloadedSessionScreenshot, error?: Error) {
		if (error) {
			console.warn(error.message);
		} else {
			console.log("Saving " + download!.url + " to " + download!.filePath);
		}
	}
}

export class Video implements ScreenshotCallbackCommand {
	private downloads: any = {};

	public onDownload(download?: DownloadedSessionScreenshot, error?: Error) {
		if (download) {
			if (!this.downloads[download.id]) {
				this.downloads[download.id] = {
					seen: 1,
					downloads: [download],
				}
			} else {
				this.downloads[download.id].downloads.push(download);
				this.downloads[download.id].seen = this.downloads[download.id].seen + 1;
			}

			if (this.downloads[download.id].seen === download.totalImages) {
				this.processSession(download.id);
			}
		}

		if (error) {
			console.warn(error.message);
		}
	}

	private processSession(sessionId: number) {
		const downloads = this.downloads[sessionId].downloads;
		if (!downloads || downloads.length == 0) {
			console.log("No images downloaded for session");
			return;
		}

		const download = downloads[0];
		const session = download.session;
		const filesPath = path.dirname(download.filePath);
		const pieces = session.split("/");
		const filename = `${filesPath}/${pieces[2]}-${pieces[4]}-${pieces[6]}.mp4`;
		if (fs.existsSync(filename)) {
			console.log(filename + " already exists");
			return;
		}

		console.log(`All ${downloads.length} images for ${session} have been downloaded.`);
		console.log(`Creating video ${filename}`);

		const command = `${ffmpeg.path} -r 1 -pattern_type glob -i '${filesPath}/*.jpg' -c:v libx264 ${filename}`;
		exec.exec(command, (err, stdout, stderr) => {
			if (err) {
				console.log(`ffmpeg:stdout: ${stdout}`);
				console.log(`ffmpeg:stderr: ${stderr}`);
				console.log("Failed to create video", err);
			} else {
				console.log(`Session recording ${session} saved to ${filename}`);
			}
		});
	}
}
