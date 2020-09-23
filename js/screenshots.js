"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const screenshotCallback_1 = require("./screenshotCallback");
const fs = __importStar(require("fs"));
const imageDownloader_1 = require("./imageDownloader");
const sprintf = require('sprintf-js').sprintf;
const formatTimestamp = (ts) => {
    return sprintf("%07.3f", ts); // 7 includes the point and 3
};
const downloadImage = (data, options) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(data.filePath)) {
            console.log(data.filePath + " already exists");
            resolve(data);
        }
        else {
            const imageDownloader = new imageDownloader_1.ImageDownloader(options);
            imageDownloader.download(data, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        }
    });
};
const downloadImages = (data, options, callback) => {
    if (!data || !data.events) {
        return Promise.resolve([]);
    }
    const events = data.events.screenshotEvents || [];
    const rootPath = "testfairy-sessions";
    const dirPath = rootPath + data.url;
    fs.mkdirSync(dirPath, { recursive: true });
    const downloads = events.map((event, index) => {
        const filePath = dirPath + "/" + formatTimestamp(event.ts) + ".jpg";
        const download = {
            id: data.id,
            session: data.url,
            url: event.url,
            timestamp: event.ts,
            filePath: filePath,
            imageIndex: index,
            totalImages: events.length
        };
        return downloadImage(download, options)
            .then((item) => callback.onDownload(item))
            .catch((error) => callback.onDownload(undefined, error));
    });
    return Promise.all(downloads);
};
exports.screenshots = (sessions, options) => __awaiter(void 0, void 0, void 0, function* () {
    const callback = options.contains('video') ? new screenshotCallback_1.Video() : new screenshotCallback_1.NoOp();
    const downloads = sessions
        .map(session => downloadImages(session, options, callback)).filter(promise => promise != null);
    yield Promise.all(downloads);
});
//# sourceMappingURL=screenshots.js.map