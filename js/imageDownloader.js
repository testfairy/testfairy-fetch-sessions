"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("https");
const fs = require("fs");
class ImageDownloader {
    download(download, callback) {
        const file = fs.createWriteStream(download.filePath);
        try {
            http.get(download.url, (res) => {
                res.pipe(file);
                callback();
            });
        }
        catch (error) {
            callback(error);
        }
    }
}
exports.ImageDownloader = ImageDownloader;
