"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = exports.NoOp = void 0;
const path = __importStar(require("path"));
const exec = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const tmp = __importStar(require("tmp"));
const canvas_1 = require("canvas");
const ffmpeg = require('ffmpeg-static');
;
class NoOp {
    onDownload(downloads, session) {
        return __awaiter(this, void 0, void 0, function* () {
            if (downloads.length === 0) {
                return;
            }
            const count = downloads.reduce((previous, current) => {
                return current.filePath === null ? previous : (previous + 1);
            }, 0);
            const total = downloads[0].totalImages;
            const filesPath = downloads[0].filePath === null ? "" : path.dirname(downloads[0].filePath);
            console.log(`Downloaded ${count} of ${total} screenshots to in to ${filesPath}`);
        });
    }
}
exports.NoOp = NoOp;
class Video {
    constructor(option) {
        this.option = option;
        this.downloads = {};
    }
    onDownload(downloads, session) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.option.contains("show-touches")) {
                yield this.createVideo(downloads, session);
            }
            else {
                yield this.generateVideo(downloads);
            }
        });
    }
    generateVideo(downloads) {
        return __awaiter(this, void 0, void 0, function* () {
            if (downloads.length == 0) {
                console.log("No images downloaded for session");
                return;
            }
            const download = downloads[0];
            const { session } = download;
            const config = this.getFilePath(download);
            if (config == null) {
                return;
            }
            const { filesPath, filename } = config;
            console.log(`All ${downloads.length} images for ${session} have been downloaded.`);
            console.log(`Creating video ${filename}.mp4`);
            const command = `${ffmpeg} -r 1 -pattern_type glob -i '${filesPath}/*.jpg' -c:v libx264 ${filename}.mp4`;
            exec.exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.log(`ffmpeg:stdout: ${stdout}`);
                    console.log(`ffmpeg:stderr: ${stderr}`);
                    console.log("Failed to create video", err);
                }
                else {
                    console.log(`Session recording ${session} saved to ${filename}.mp4`);
                }
            });
        });
    }
    getFilePath(download) {
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
        return { filesPath, filename };
    }
    createVideo(downloads, session) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const maxWidth = Math.max.apply(Math, downloads.map(function (o) { return o.width; }));
            const maxHeight = Math.max.apply(Math, downloads.map(function (o) { return o.height; }));
            let canvases = yield Promise.all(downloads.map((image) => __awaiter(this, void 0, void 0, function* () {
                const filePath = image.filePath || "";
                const width = image.width;
                const height = image.height;
                const canvas = yield this.createOffscreenCanvas(filePath, maxWidth, maxHeight);
                return { canvas, name: `screenshot_${image.imageIndex}.jpg`, timestamp: image.timestamp, width, height };
            })));
            const touches = session.events.inputEvents.filter((event) => {
                var eventType = Video.EVENT_TYPE_TOUCH;
                if (typeof (event.t) != "undefined") {
                    eventType = event.t;
                }
                return (eventType === Video.EVENT_TYPE_TOUCH);
            }).map((event, index) => __awaiter(this, void 0, void 0, function* () {
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
                const canvas = this.copyTouchCanvas(currentCanvas, event, session.platform, { screenWidth: session.deviceScreenWidth, screenHeight: session.deviceScreenHeight });
                const data = yield this.convertCanvasToBinary(canvas, path.join(canvasDirectory, name));
                return { data, name, timestamp: event.ts };
            }));
            const result = yield Promise.all(canvases.map((image) => __awaiter(this, void 0, void 0, function* () {
                const { name, timestamp, canvas } = image;
                const data = yield this.convertCanvasToBinary(canvas, path.join(canvasDirectory, name));
                return { name, data, timestamp };
            })).concat(touches));
            console.log(`Rendering ${result.length} images.\n\tSession screenshot count: ${downloads.length}.\n\tGenerated Touch screenshot count: ${touches.length}`);
            yield this.exportFiles(result, config.filename);
        });
    }
    createOffscreenCanvas(downloadPath, canvasWidth, canvasHeight) {
        return __awaiter(this, void 0, void 0, function* () {
            const offScreenCanvas = canvas_1.createCanvas(canvasWidth, canvasHeight);
            const context = offScreenCanvas.getContext("2d");
            const image = yield canvas_1.loadImage(downloadPath);
            const widthOffset = (offScreenCanvas.width - image.width) >> 1;
            const heightOffset = (offScreenCanvas.height - image.height) >> 1;
            context.drawImage(image, widthOffset, heightOffset);
            return offScreenCanvas;
        });
    }
    convertCanvasToBinary(canvas, output) {
        return __awaiter(this, void 0, void 0, function* () {
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
            return new Promise((resolve, reject) => {
                const out = fs.createWriteStream(output);
                const stream = canvas.createJPEGStream();
                stream.pipe(out);
                out.on('finish', () => resolve(output));
                out.on('error', () => resolve(output));
            });
            ;
        });
    }
    copyTouchCanvas(canvas, event, platform, deviceExtra) {
        const offScreenCanvas = canvas.canvas;
        const copy = canvas_1.createCanvas(offScreenCanvas.width, offScreenCanvas.height);
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
    exportFiles(images, output) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const command = `${ffmpeg} -f concat -safe 0 -i ${ffmpegInputFile} -vf showinfo -b:v 1000K ${output}.mp4`;
            exec.exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.log(`ffmpeg:stdout: ${stdout}`);
                    console.log(`ffmpeg:stderr: ${stderr}`);
                    console.log("Failed to create video", err);
                }
                else {
                    console.log(`Session recording saved to ${output}`);
                }
            });
        });
    }
}
exports.Video = Video;
Video.PLATFORM_APPLE = 1;
Video.EVENT_TYPE_TOUCH = 0;
Video.EVENT_ACTION_TOUCH_DOWN = 0;
Video.EVENT_ACTION_TOUCH_MOVE = 2;
Video.TOUCH_RADIUS = 16;
//# sourceMappingURL=screenshotCallback.js.map