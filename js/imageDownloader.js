"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("https");
const fs = require("fs");
class ImageDownloader {
    download(imageUrl, path) {
        const file = fs.createWriteStream(path);
        try {
            http.get(imageUrl, (res) => res.pipe(file));
        }
        catch (error) {
            console.dir(error);
        }
    }
}
exports.ImageDownloader = ImageDownloader;
