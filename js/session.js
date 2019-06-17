"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const request = require("request");
const imageDownloader_1 = require("./imageDownloader");
const sprintf = require('sprintf-js').sprintf;
class Session {
    constructor(endpoint, httpOptions, url) {
        this.endpoint = endpoint;
        this.httpOptions = httpOptions;
        this.url = url;
        this.dirPath = "testfairy-sessions" + url;
        this.logFilePath = this.dirPath + "/session.log";
    }
    log() {
        if (fs.existsSync(this.logFilePath)) {
            console.log(this.logFilePath + " already exists");
            return;
        }
        fs.mkdirSync(this.dirPath, { recursive: true });
        request.get("https://" + this.endpoint + "/api/1" + this.url + "?fields=logs", this.httpOptions, (error, res, log) => this.saveLogs(error, res, log));
    }
    saveLogs(error, res, log) {
        fs.writeFileSync(this.dirPath + '/session.log', log);
    }
    screenshots(callback) {
        fs.mkdirSync(this.dirPath, { recursive: true });
        const endpoint = "https://" + this.endpoint + "/api/1" + this.url + "?fields=events";
        request.get(endpoint, this.httpOptions, (error, res, events) => this.onScreenshotsUrls(error, res, events, callback));
    }
    formatTimestamp(ts) {
        return sprintf("%07.3f", ts); // 7 includes the point and 3
    }
    onScreenshotsUrls(error, res, events, callback) {
        if (error) {
            callback(undefined, error);
            return;
        }
        events = JSON.parse(events.toString());
        const imageDownloader = new imageDownloader_1.ImageDownloader();
        const screenshotEvents = events.session.events.screenshotEvents;
        if (!screenshotEvents) {
            callback(undefined, new Error(`No screenshots found for session with id ${events.session.id}`));
            return;
        }
        var index = 0;
        for (let item of screenshotEvents) {
            let filePath = this.dirPath + "/" + this.formatTimestamp(item.ts) + ".jpg";
            const download = {
                id: events.session.id,
                session: this.url,
                url: item.url,
                timestamp: item.ts,
                filePath: filePath,
                imageIndex: index++,
                totalImages: screenshotEvents.length
            };
            if (fs.existsSync(filePath)) {
                console.log(filePath + " already exists");
                callback(download);
                continue;
            }
            imageDownloader.download(download, (error) => {
                callback(download, error);
            });
        }
    }
}
exports.Session = Session;
