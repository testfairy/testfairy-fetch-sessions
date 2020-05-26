"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageDownloader = void 0;
const http = require("https");
const fs = require("fs");
class ImageDownloader {
    download(download, callback) {
        const file = fs.createWriteStream(download.filePath);
        file.on('error', (error) => {
            callback(error);
        });
        file.on('finish', function () {
            callback();
        });
        try {
            http.get(download.url, (res) => {
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