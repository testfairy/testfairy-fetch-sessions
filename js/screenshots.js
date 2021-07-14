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
exports.screenshots = void 0;
const screenshotCallback_1 = require("./screenshotCallback");
const fs = __importStar(require("fs"));
const imageDownloader_1 = require("./imageDownloader");
const sprintf = require('sprintf-js').sprintf;
const formatTimestamp = (ts) => {
    return sprintf("%07.3f", ts); // 7 includes the point and 3
};
const downloadImage = (data, options) => {
    return new Promise((resolve, reject) => {
        if (data.filePath === null) {
            console.log(data.id + " has no destination file");
            resolve(data);
        }
        else if (data.filePath !== null && fs.existsSync(data.filePath)) {
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
const downloadImages = (data, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data || !data.events) {
        return Promise.resolve([]);
    }
    const screenshots = data.events.screenshotEvents || [];
    const rootPath = "testfairy-sessions";
    const dirPath = rootPath + data.url;
    fs.mkdirSync(dirPath, { recursive: true });
    const downloads = screenshots.map((event, index) => __awaiter(void 0, void 0, void 0, function* () {
        const filePath = dirPath + "/" + formatTimestamp(event.ts) + ".jpg";
        const download = {
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
            yield downloadImage(download, options);
        }
        catch (_a) {
            console.log(`Failed to download screenshot ${index} from session ${data.id}`);
            download.filePath = null;
        }
        return download;
    }));
    return Promise.all(downloads);
});
exports.screenshots = (sessions, options) => __awaiter(void 0, void 0, void 0, function* () {
    const callback = options.contains('video') ? new screenshotCallback_1.Video(options) : new screenshotCallback_1.NoOp();
    const downloads = sessions
        .map((session) => __awaiter(void 0, void 0, void 0, function* () {
        const downloaded = yield downloadImages(session, options);
        return { downloaded, session };
    }))
        .map((promise) => __awaiter(void 0, void 0, void 0, function* () {
        const { downloaded, session } = yield promise;
        return yield callback.onDownload(downloaded, session);
    }));
    yield Promise.all(downloads);
});
//# sourceMappingURL=screenshots.js.map