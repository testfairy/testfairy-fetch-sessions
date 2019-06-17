"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="session.ts"/>
const request = require("request");
const session_1 = require("./session");
class Sessions {
    constructor(endpoint, auth) {
        this.endpoint = endpoint;
        this.auth = auth;
        this.httpOptions = {
            auth: this.auth,
        };
    }
    logs(predicates) {
        this.getSessions(predicates, (error, res, body) => this.getLogForSessions(error, res, body));
    }
    screenshots(predicates) {
        this.getSessions(predicates, (error, res, body) => this.getScreenshotsForSessions(error, res, body));
    }
    getLogForSessions(error, response, body) {
        body = JSON.parse(body.toString());
        for (let session of body.sessions) {
            new session_1.Session(this.endpoint, this.httpOptions, session.url).log();
        }
    }
    getScreenshotsForSessions(error, response, body) {
        body = JSON.parse(body.toString());
        for (let session of body.sessions) {
            new session_1.Session(this.endpoint, this.httpOptions, session.url).screenshots((download, error) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("Saving " + download.url + " to " + download.filePath);
                }
            });
        }
    }
    getSessions(predicates, callback) {
        let option = Object.assign({}, this.httpOptions, {
            form: {
                "predicates": JSON.stringify(predicates),
                "fields": "url"
            }
        });
        // request.post("https://"+this.endpoint+"/api/1/search/", option, (error, response, body) => this.getLogForSessions(error, response, body));
        request.post("https://" + this.endpoint + "/api/1/search/", option, (error, response, body) => callback(error, response, body));
    }
}
exports.Sessions = Sessions;
