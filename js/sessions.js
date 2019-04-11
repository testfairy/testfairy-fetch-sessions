"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const session_1 = require("./session");
class Sessions {
    constructor(endpoint, projectId, auth) {
        this.endpoint = endpoint;
        this.projectId = projectId;
        this.auth = auth;
        this.httpOptions = {
            auth: this.auth,
        };
    }
    logs() {
        this.getSessions((error, res, body) => this.getLogForSessions(error, res, body));
    }
    screenshots() {
        this.getSessions((error, res, body) => this.getScreenshotsForSessions(error, res, body));
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
            new session_1.Session(this.endpoint, this.httpOptions, session.url).screenshots();
        }
    }
    getSessions(callback) {
        var predicates = [
            {
                "type": "number",
                "attribute": "project_id",
                "comparison": "eq",
                "value": this.projectId
            }
        ];
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
