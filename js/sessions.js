"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="session.ts"/>
const request = require("request");
const session_1 = require("./session");
class Sessions {
    constructor(endpoint, rootPath, auth) {
        this.endpoint = endpoint;
        this.rootPath = rootPath;
        this.auth = auth;
        this.httpOptions = {
            auth: this.auth,
        };
    }
    logs(predicates) {
        this.getSessions(predicates, (error, res, body) => this.getLogForSessions(error, res, body));
    }
    screenshots(predicates, callback) {
        this.getSessions(predicates, (error, res, body) => this.getScreenshotsForSessions(error, res, body, callback));
    }
    getLogForSessions(error, response, body) {
        body = JSON.parse(body.toString());
        for (let session of body.sessions) {
            let dirPath = this.rootPath + session.url;
            new session_1.Session(this.endpoint, this.httpOptions, session.url, dirPath).log();
        }
    }
    getScreenshotsForSessions(error, response, body, callback) {
        body = JSON.parse(body.toString());
        for (let session of body.sessions) {
            let dirPath = this.rootPath + session.url;
            new session_1.Session(this.endpoint, this.httpOptions, session.url, dirPath).screenshots(callback);
        }
    }
    getSessions(predicates, callback) {
        let option = Object.assign({}, this.httpOptions, {
            form: {
                "predicates": JSON.stringify(predicates),
                "fields": "url"
            }
        });
        request.post("https://" + this.endpoint + "/api/1/search/", option, (error, response, body) => callback(error, response, body));
    }
}
exports.Sessions = Sessions;
