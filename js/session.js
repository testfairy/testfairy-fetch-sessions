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
        this.dirPath = "res" + url;
        this.logFilePath = this.dirPath + "/session.log";
    }
    log() {
        if (fs.existsSync(this.logFilePath)) {
            console.log(this.logFilePath + " already exists");
            return;
        }
        fs.mkdirSync("res" + this.url, { recursive: true });
        request.get("https://" + this.endpoint + "/api/1" + this.url + "?fields=logs", this.httpOptions, (error, res, log) => this.saveLogs(error, res, log));
    }
    saveLogs(error, res, log) {
        fs.writeFileSync("res" + this.url + '/session.log', log);
    }
    screenshots() {
        fs.mkdirSync("res" + this.url, { recursive: true });
        request.get("https://" + this.endpoint + "/api/1" + this.url + "?fields=events", this.httpOptions, (error, res, events) => this.onScreenshotsUrls(error, res, events));
    }
    formatTimestamp(ts) {
        return sprintf("%07.3f", ts); // 7 includes the point and 3
    }
    onScreenshotsUrls(error, res, events) {
        events = JSON.parse(events.toString());
        const imageDownloader = new imageDownloader_1.ImageDownloader();
        for (let item of events.session.events.screenshotEvents) {
            let filePath = this.dirPath + "/" + this.formatTimestamp(item.ts) + ".jpg";
            if (fs.existsSync(filePath)) {
                console.log(filePath + " already exists");
                return;
            }
            console.log("Saving " + item.url + " to " + filePath);
            imageDownloader.download(item.url, filePath);
        }
    }
}
exports.Session = Session;
