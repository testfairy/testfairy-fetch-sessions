"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("https");
const fs = require("fs");
class ImageDownloader {
    download(download, callback) {
        const file = fs.createWriteStream(download.filePath);
        file.on('error', (error) => {
            callback(error);
        });
        try {
            http.get(download.url, (res) => {
                res.pipe(file);
                file.on('finish', function () {
                    callback();
                });
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
