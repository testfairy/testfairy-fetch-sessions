import * as path from "path";
import * as exec from "child_process";
import * as fs from 'fs';
import * as tmp from 'tmp';

import {DownloadedSessionScreenshot, InputEvent, Options, SessionData} from "./models";
import {Canvas, createCanvas, loadImage} from "canvas";

const ffmpeg = require('ffmpeg-static');

interface DownloadMapItem {
	seen: number;
	downloads: DownloadedSessionScreenshot[];
	touches: InputEvent[];
}

interface VideoScreenshotCanvas {
	canvas: Canvas;
	name: string; 
	timestamp: number; 
	width: number; 
	height: number
};

export interface ScreenshotCallbackCommand {
	onDownload(downloads: DownloadedSessionScreenshot[], session: SessionData): void;
}

export class NoOp implements ScreenshotCallbackCommand {
	async onDownload(downloads: DownloadedSessionScreenshot[], session: SessionData) {
		if (downloads.length === 0) {
			return;
		}

		const count = downloads.reduce((previous, current) => {
			return current.filePath === null ? previous : (previous + 1);
		}, 0);

		const total = downloads[0].totalImages;
		const filesPath = downloads[0].filePath === null ? "" : path.dirname(downloads[0].filePath);
		console.log(`Downloaded ${count} of ${total} screenshots to in to ${filesPath}`);
	}
}

export class Video implements ScreenshotCallbackCommand {
	private static readonly PLATFORM_APPLE = 1;
	private static readonly EVENT_TYPE_TOUCH = 0;
	private static readonly EVENT_ACTION_TOUCH_DOWN = 0;
	private static readonly EVENT_ACTION_TOUCH_MOVE = 2;
	private static readonly TOUCH_RADIUS = 16;

	private downloads: {[key: number]: DownloadMapItem} = {};

	constructor(private option: Options) {}
	async onDownload(downloads: DownloadedSessionScreenshot[], session: SessionData) {
		if (this.option.contains("show-touches")) {
			await this.createVideo(downloads, session);
		} else {
			await this.generateVideo(downloads);
		}
	}

	private async generateVideo(downloads: DownloadedSessionScreenshot[]) {
		if (downloads.length == 0) {
			console.log("No images downloaded for session");
			return;
		}

		const download = downloads[0];
		const {session} = download;
		const config = this.getFilePath(download);
		if (config == null) {
			return;
		}

		const {filesPath, filename} = config;
		console.log(`All ${downloads.length} images for ${session} have been downloaded.`);
		console.log(`Creating video ${filename}.mp4`);

		const command = `${ffmpeg.path} -r 1 -pattern_type glob -i '${filesPath}/*.jpg' -c:v libx264 ${filename}.mp4`;
		exec.exec(command, (err, stdout, stderr) => {
			if (err) {
				console.log(`ffmpeg:stdout: ${stdout}`);
				console.log(`ffmpeg:stderr: ${stderr}`);
				console.log("Failed to create video", err);
			} else {
				console.log(`Session recording ${session} saved to ${filename}.mp4`);
			}
		});
	}

	private getFilePath(download: DownloadedSessionScreenshot) {
		if (download.filePath === null) {
			console.log("No images downloaded for session");
			return null;
		}

		const session = download.session;
		const filesPath = path.dirname(download.filePath);
		const pieces = session.split("/");
		const filename = `${filesPath}/${pieces[2]}-${pieces[4]}-${pieces[6]}`;
		const output = `${filename}.mp4`;
		if (fs.existsSync(output)) {
			if (!this.option.contains("overwrite")) {
				console.log(output + " already exists");
				return null;
			}
			fs.unlinkSync(output);
		}

		return {filesPath, filename};
	}

	private async createVideo(downloads: DownloadedSessionScreenshot[], session: SessionData) {
		downloads = downloads
			.filter(value => value.filePath !== null)
			.sort((a, b) => {
				if (a.timestamp > b.timestamp) {
					return 1;
				}
				if (b.timestamp > a.timestamp) {
					return -1;
				}
				return 0;
			});

		if (downloads.length == 0) {
			console.log("No images downloaded for session");
			return;
		}

		const download = downloads[0];
		const config = this.getFilePath(download);
		if (config == null) {
			return;
		}

		const canvasDirectory = tmp.dirSync().name;
		const maxWidth = Math.max.apply(Math, downloads.map(function(o) { return o.width; }));
		const maxHeight = Math.max.apply(Math, downloads.map(function(o) { return o.height; }));
		let canvases = await Promise.all(downloads.map(async (image) => {
			const filePath = image.filePath || "";
			const width = image.width;
			const height = image.height;
			const canvas = await this.createOffscreenCanvas(filePath, maxWidth, maxHeight);
			return {canvas, name: `screenshot_${image.imageIndex}.jpg`, timestamp: image.timestamp, width, height};
		}));

		const touches = session.events.inputEvents.filter((event: InputEvent) => {
			var eventType = Video.EVENT_TYPE_TOUCH;
			if (typeof(event.t) != "undefined") {
				eventType = event.t;
			}

			return (eventType === Video.EVENT_TYPE_TOUCH);
		}).map(async (event: InputEvent, index: number) => {
			let currentCanvas = canvases[0];
			let i = 1;
			for (; i < canvases.length; i++) {
				const image = canvases[i];
				if (image.timestamp > event.ts) {
					break;
				}

				currentCanvas = image;
			}
			
			// console.log(`Max Image width: ${maxWidth} x height: ${maxHeight}`);
			// console.log(`Image width: ${image.image.width} x height: ${image.image.height}`);
			const name = `touch_${index}.jpg`;
			const canvas = this.copyTouchCanvas(
				currentCanvas,
				event,
				session.platform,
				{screenWidth: session.deviceScreenWidth, screenHeight: session.deviceScreenHeight}
			);

			const data = await this.convertCanvasToBinary(canvas, path.join(canvasDirectory, name));
			return { data, name, timestamp: event.ts };
		});

		const result = await Promise.all(canvases.map(async (image) => {
			const {name, timestamp, canvas}  = image;
			const data = await this.convertCanvasToBinary(canvas, path.join(canvasDirectory, name));
			return {name, data, timestamp};
		}).concat(touches));

		console.log(`Rendering ${result.length} images.\n\tSession screenshot count: ${downloads.length}.\n\tGenerated Touch screenshot count: ${touches.length}`);
		await this.exportFiles(result, config.filename);
	}

	private async createOffscreenCanvas(downloadPath: string, canvasWidth: number, canvasHeight: number) {
		const offScreenCanvas = createCanvas(canvasWidth, canvasHeight);
		const context = offScreenCanvas.getContext("2d");

		const image = await loadImage(downloadPath);
		const widthOffset = (offScreenCanvas.width - image.width) >> 1;
		const heightOffset = (offScreenCanvas.height - image.height) >> 1;
		context.drawImage(image, widthOffset, heightOffset);

		return offScreenCanvas;
	}

	private async convertCanvasToBinary(canvas: Canvas, output: string) {
		// const dataURI = canvas.toDataURL("image/jpeg");
		// const BASE64_MARKER = ';base64,';
		// const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
		// const base64 = dataURI.substring(base64Index);
		// const raw = atob(base64);
		// const rawLength = raw.length;
		// const array = new Uint8Array(new ArrayBuffer(rawLength));

		// for (let i = 0; i < rawLength; i++) {
		//   array[i] = raw.charCodeAt(i);
		// }

		// return array;

		return new Promise<string>((resolve, reject) => {
			const out = fs.createWriteStream(output);
			const stream = canvas.createJPEGStream();
			stream.pipe(out)
			out.on('finish', () =>  resolve(output));
			out.on('error', () =>  resolve(output));
		});;
	}

	private copyTouchCanvas(
		canvas: VideoScreenshotCanvas,
		event: any,
		platform: number,
		deviceExtra: {screenWidth: number, screenHeight: number},
	) {
		const offScreenCanvas = canvas.canvas;
		const copy = createCanvas(offScreenCanvas.width, offScreenCanvas.height);
		let widthOffset = (offScreenCanvas.width >> 1) - (canvas.width >> 1);
		let heightOffset = (offScreenCanvas.height >> 1) - (canvas.height >> 1);

		const context = copy.getContext("2d");
		context.drawImage(offScreenCanvas, 0, 0);

		if (event.act === Video.EVENT_ACTION_TOUCH_DOWN || event.act === Video.EVENT_ACTION_TOUCH_MOVE) {
			const touchRadius = Video.TOUCH_RADIUS;
			const halfTouchRadius = touchRadius >> 1;

			let xPos = event.x + widthOffset;
			let yPos = event.y + heightOffset;
			if (platform == Video.PLATFORM_APPLE) {
				const deviceExtraScreenWidth = deviceExtra.screenWidth;
				const deviceExtraScreenHeight = deviceExtra.screenHeight;

				const widthScale = offScreenCanvas.width / deviceExtraScreenWidth;
				const heightScale = offScreenCanvas.height / deviceExtraScreenHeight;
				xPos = event.x * widthScale + halfTouchRadius + widthOffset;
				yPos = event.y * heightScale + halfTouchRadius + heightOffset;
			}

			context.beginPath();
			context.arc(xPos, yPos, touchRadius, 0, 2 * Math.PI, true);
			context.fillStyle = 'yellow';
			context.fill();
		}

		return copy;
	}

	private async exportFiles(
		images: {data: string, name: string, timestamp: number}[],
		output: string
	) {
		if (images.length < 1) {
			return;
		}

		images.sort((a, b) => {
			if (a.timestamp > b.timestamp) {
				return 1;
			}
			if (b.timestamp > a.timestamp) {
				return -1;
			}
			return 0;
		});

		let durationFile = "";

		durationFile += "file '" + images[0].data + "'\n";
		for (let index = 0; index < images.length; index++) {
			let timestamp = images[index].timestamp;
			if (index > 0) {
				timestamp = images[index].timestamp - images[index - 1].timestamp;
			}

			durationFile += "duration " + timestamp + "\n" + "file '" + images[index].data + "'\n";
		}

		const ffmpegInputFile = `${output}.txt`;
		if (fs.existsSync(ffmpegInputFile)) {
			fs.unlinkSync(ffmpegInputFile);
		}
		fs.writeFileSync(ffmpegInputFile, durationFile);

		const command = `${ffmpeg.path} -f concat -safe 0 -i ${ffmpegInputFile} -vf showinfo -b:v 1000K ${output}.mp4`;
		exec.exec(command, (err, stdout, stderr) => {
			if (err) {
				console.log(`ffmpeg:stdout: ${stdout}`);
				console.log(`ffmpeg:stderr: ${stderr}`);
				console.log("Failed to create video", err);
			} else {
				console.log(`Session recording saved to ${output}`);
			}
		});
	}
}
