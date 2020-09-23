"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageDownloader = void 0;
const http = require("https");
const url = require("url");
const fs = require("fs");
class ImageDownloader {
    constructor(options) {
        this.options = options;
    }
    download(download, callback) {
        const file = fs.createWriteStream(download.filePath);
        file.on('error', (error) => {
            callback(error);
        });
        file.on('finish', function () {
            callback();
        });
        try {
            const parsedUrl = url.parse(download.url);
            const options = Object.assign(Object.assign({}, parsedUrl), { agent: this.options.agent });
            http.get(options, (res) => {
                res.pipe(file);
            }).on('error', (error) => {
                callback(error);
            });
        }
        catch (error) {
            callback(error);
        }
    }
}
exports.ImageDownloader = ImageDownloader;
//# sourceMappingURL=imageDownloader.js.map