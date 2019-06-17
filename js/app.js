"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// lib/app.ts
const sessions_1 = require("./sessions");
const screenshotCallback_1 = require("./screenshotCallback");
const console_stamp = require('console-stamp');
const commandline_args = require('command-line-args');
const options_definitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'project-id', type: Number },
    { name: 'user', type: String },
    { name: 'api-key', type: String },
    { name: 'endpoint', type: String },
    { name: 'logs' },
    { name: 'screenshots' },
    { name: 'video' }
];
console_stamp(console, 'HH:MM:ss.l');
class SessionsTool {
    static main() {
        const tool = new SessionsTool();
        tool.run();
    }
    run() {
        const options = commandline_args(options_definitions);
        this.assertNoMissingParams(options, ["user", "api-key"]);
        const auth = {
            "user": options["user"],
            "pass": options["api-key"]
        };
        let rootPath = "testfairy-sessions";
        if (options['logs'] !== undefined) {
            this.assertNoMissingParams(options, ["project-id", "endpoint"]);
            const predicates = [{
                    "type": "number",
                    "attribute": "project_id",
                    "comparison": "eq",
                    "value": options['project-id']
                }];
            const sessions = new sessions_1.Sessions(this.getEndpoint(options), rootPath, auth);
            sessions.logs(predicates);
        }
        if (options['screenshots'] !== undefined) {
            this.assertNoMissingParams(options, ["project-id", "endpoint"]);
            const predicates = [{
                    "type": "number",
                    "attribute": "project_id",
                    "comparison": "eq",
                    "value": options['project-id']
                }];
            const sessions = new sessions_1.Sessions(this.getEndpoint(options), rootPath, auth);
            let callback = options['video'] === undefined ? new screenshotCallback_1.NoOp() : new screenshotCallback_1.Video(rootPath);
            sessions.screenshots(predicates, callback);
        }
    }
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
    help() {
        console.log("Usage: fetch-sessions-tool --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" --project-id=1000 [--logs] [--screenshots] [--video]");
        console.log("");
        console.log("This tool downloads screenshots and/or logs from recorded TestFairy sessions. Use this to download data to analyze");
        console.log("sessions with your own toolchain or to import to your own analytics systems.");
        process.exit(1);
    }
    getEndpoint(options) {
        const endpoint = options.endpoint;
        if (endpoint.indexOf(":") >= 0 || endpoint.indexOf("/") >= 0) {
            console.error("Invalid value for option \"endpoint\". Please supply only domain name, for example: \"mycompany.testfairy.com\".");
            this.help();
        }
        return endpoint;
    }
    assertNoMissingParams(options, required) {
        if (this.isEmpty(options) || options.help) {
            this.help();
        }
        for (var i = 0; i < required.length; i++) {
            var k = required[i];
            if (!(k in options)) {
                console.error("Missing value of option \"" + k + "\"");
                this.help();
            }
        }
        if (!("logs" in options) && !("screenshots" in options) && !("sessions" in options)) {
            console.error("Must provide at least one of --logs, --screenshots or --sessions");
            this.help();
        }
    }
}
SessionsTool.main();
