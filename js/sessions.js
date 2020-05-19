"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const session_1 = require("./session");
class Sessions {
    constructor(endpoint, rootPath) {
        this.endpoint = endpoint;
        this.rootPath = rootPath;
    }
    screenshots(sessions, callback) {
        this.getScreenshotsForSessions(sessions, callback);
    }
    getScreenshotsForSessions(body, callback) {
        for (let session of body.sessions) {
            let dirPath = this.rootPath + session.url;
            new session_1.Session(this.endpoint, this.httpOptions, session.url, dirPath).screenshots(callback);
        }
    }
}
exports.Sessions = Sessions;
//# sourceMappingURL=sessions.js.map