import {Command} from './command';
import {Auth} from "../auth";
import {Session} from "../session";
import {DownloadedSessionScreenshot} from "../sessionInterface";

import * as url from "url";
import * as path from "path";
import * as exec from "child_process";
import * as fs from 'fs';

const ffmpeg = require('ffmpeg-static');

export class Video implements Command {
	private downloads: any = {};

	run(auth: Auth, options: any): void {
		const sessionUrls = <string[]>options['sessions'];
		const httpOptions = {
			auth: auth,
		};
		sessionUrls.forEach(sessionUrl => {
			const parsedUrl = url.parse(sessionUrl);
			console.log(`Retrieving image from ${parsedUrl.hostname} at ${parsedUrl.pathname}`);

			const pieces = parsedUrl.pathname!.split("/");
			const filename = `${pieces[2]}-${pieces[4]}-${pieces[6]}.mp4`;
			if (fs.existsSync(filename)) {
				console.log(filename + " already exists");
			} else {
				new Session(parsedUrl.hostname!, httpOptions, parsedUrl.pathname!).screenshots(this.onDownload.bind(this));
			}
		});
	}

	private onDownload(download?: DownloadedSessionScreenshot, error?: Error) {
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
			console.log(error);
		}
	}

	private processSession(sessionId: number) {
		const downloads = this.downloads[sessionId].downloads;
		if (!downloads || downloads.length == 0) {
			console.log("No images downloaded for session");
			return;
		}

		const session = downloads[0].session;
		const pieces = session.split("/");
		const filename = `${pieces[2]}-${pieces[4]}-${pieces[6]}.mp4`;
		const filesPath = path.dirname(downloads[0].filePath);

		console.log(`All ${downloads.length} images for ${session} have been downloaded. Creating video ${filename}`);

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