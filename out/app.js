"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// lib/app.ts
const request = require('request');
// import * as request from "request-promise-native";
// import RequestCallback = request.RequestCallback;
const console_stamp = require('console-stamp');
const commandline_args = require('command-line-args');
const options_definitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'project-id', type: Number },
    { name: 'user', type: String },
    { name: 'api-key', type: String },
    { name: 'endpoint', type: String }
];
console_stamp(console, 'HH:MM:ss.l');
class DeleteOldSessionsTool {
    main() {
        let options = commandline_args(options_definitions);
        this.assertNoMissingParams(options);
        let auth = {
            "user": options["user"],
            "pass": options["api-key"]
        };
        var endpoint = options.endpoint;
        if (endpoint.indexOf(":") >= 0 || endpoint.indexOf("/") >= 0) {
            console.error("Invalid value for option \"endpoint\". Please supply only domain name, for example: \"mycompany.testfairy.com\".");
            this.help();
        }
        this.fetch_sessions(endpoint, auth, options['project-id']);
    }
    fetch_sessions(endpoint, auth, projectId) {
        var predicates = [
            {
                "type": "number",
                "attribute": "project_id",
                "comparison": "eq",
                "value": projectId
            }
        ];
        var options = {
            auth: {
                "user": auth.user,
                "pass": auth.pass
            },
            form: {
                "predicates": JSON.stringify(predicates),
                // "page": 1,
                // "per_page": 25,
                "fields": "url,email"
            }
        };
        // const result = await request.get(options);
        // let a =   RequestCallback();
        // a.
        var req = request.post("https://" + endpoint + "/api/1/search/", options, function (error, response, body) {
            console.log("------");
            // console.dir(err);
            // console.dir(response);
            body = JSON.parse(body);
            console.log(body);
            console.dir(body.total_count);
            console.dir(body.sessions);
            for (let session of body.sessions) {
                console.dir(session);
            }
            // var inner_options = {
            // 	auth: {
            // 		"user": user,
            // 		"pass": pass
            // 	}
            // };
            //
            // var json = JSON.parse(body);
            // sessions_left = json.sessions.length;
            // for (var i = 0; i < json.sessions.length; i++) {
            // 	var url = json.sessions[i].url;
            // 	request.get("https://app.testfairy.com/api/1" + url + "?fields=events", inner_options, onSessionLoaded.bind(null, json.sessions[i].email, url));
            // }
        });
    }
    assertNoMissingParams(options) {
        if (this.isEmpty(options) || options.help) {
            this.help();
        }
        const required = ["endpoint", "user", "api-key", "project-id"];
        for (var i = 0; i < required.length; i++) {
            var k = required[i];
            if (!(k in options)) {
                console.error("Missing value of option \"" + k + "\"");
                this.help();
            }
        }
    }
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
    help() {
        console.log("node index.js --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" --days 30 [--delete]");
        console.log("");
        console.log("Run a search for sessions older than given number of days. By default will only list session urls");
        console.log("to screen. Use --delete to also delete these sessions. Warning: once deleted, a session cannot be");
        console.log("restored from backup.");
        process.exit(0);
    }
}
new DeleteOldSessionsTool().main();
