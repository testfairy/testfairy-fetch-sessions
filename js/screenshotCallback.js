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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = exports.NoOp = void 0;
const path = __importStar(require("path"));
const exec = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const ffmpeg = require('ffmpeg-static');
class NoOp {
    onDownload(download, error) {
        if (error) {
            console.warn(error.message);
        }
        else {
            console.log("Saving " + download.url + " to " + download.filePath);
        }
    }
}
exports.NoOp = NoOp;
class Video {
    constructor() {
        this.downloads = {};
    }
    onDownload(download, error) {
        if (download) {
            if (!this.downloads[download.id]) {
                this.downloads[download.id] = {
                    seen: 1,
                    downloads: [download],
                };
            }
            else {
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
    processSession(sessionId) {
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
        console.log(`All ${downloads.length} images for ${session} have been downloaded. Creating video ${filename}`);
        const command = `${ffmpeg.path} -r 1 -pattern_type glob -i '${filesPath}/*.jpg' -c:v libx264 ${filename}`;
        exec.exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log(`ffmpeg:stdout: ${stdout}`);
                console.log(`ffmpeg:stderr: ${stderr}`);
                console.log("Failed to create video", err);
            }
            else {
                console.log(`Session recording ${session} saved to ${filename}`);
            }
        });
    }
}
exports.Video = Video;
//# sourceMappingURL=screenshotCallback.js.map