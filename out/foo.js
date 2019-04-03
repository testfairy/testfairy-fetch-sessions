"use strict";
/*
// lib/app.ts
const request = require('request');
const console_stamp = require('console-stamp');
const commandline_args = require('command-line-args');

console_stamp(console, 'HH:MM:ss.l');

class DeleteOldSessionsTool{


    private options_definitions = [
        { name: 'help', alias: 'h', type: Boolean },
        { name: 'delete', type: Boolean, defaultOption: false },
        { name: 'days', type: Number },
        { name: 'user', type: String },
        { name: 'api-key', type: String },
        { name: 'endpoint', type: String }
    ];

    search(endpoint, auth, predicates, callback) {

        var options = {
            auth: auth,
            form: {
                "predicates": JSON.stringify(predicates),
                "fields": "url",
                "per_page": 250,
                "sort": "recorded_at",
                "order": "desc"
            }
        };

        var parsed = {
            total_count: 0,
            sessions: []
        };

        // function fetch_page() {
        //
        // 	var handler = function(err, response, body) {
        //
        // 		if (err) {
        // 			console.error("Failed to run query: " + err);
        // 			return;
        // 		}
        //
        // 		var json = JSON.parse(body);
        // 		if (!json.sessions) {
        // 			console.error("Can't find sessions in response: " + body);
        // 			return;
        // 		}
        //
        // 		if (json.sessions.length > 0) {
        // 			parsed.total_count = json.total_count;
        // 			parsed.sessions = parsed.sessions.concat(json.sessions);
        //
        // 			options.form.page++;
        // 			setTimeout(() => fetch_page(), 1);
        // 		}
        //
        // 		if (json.sessions.length == 0) {
        // 			// we're done
        // 			callback(parsed);
        // 		}
        // 	}
        //
        // 	console.log("Running query for page " + options.form.page);
        // 	request.post("https://" + endpoint + "/api/1/search/", options, handler);
        // }

        options.form.page = 0;
        setTimeout(() => fetch_page(), 1);
    }

    list_response(endpoint, parsed) {

        console.log("Found " + parsed.total_count + " sessions that match search");

        for (var i = 0; i < parsed.sessions.length; i++) {
            console.log("Session URL: " + "https://" + endpoint + parsed.sessions[i].url);
        }
    }

    delete_response(endpoint, auth, parsed) {

        console.log("Deleting " + parsed.total_count + " sessions that match search");

        var urls = [];
        for (var i = 0; i < parsed.sessions.length; i++) {
            urls.push("https://" + endpoint + "/api/1" + parsed.sessions[i].url);
        }

        var delete_next = function () {
            var url = urls.pop();
            if (url) {
                console.log("Deleting session: " + url);
                request.del(url, {auth: auth}, function (err, response, body) {
                    const parsed = JSON.parse(body);
                    if (!parsed.status || parsed.status != "ok") {
                        console.error("Failed to delete session " + url + ", got response: " + body);
                        return;
                    }

                    delete_next();
                });
            }
        };

        delete_next();
    }

    fetch_sessions(endpoint, auth, days, del) {

        var predicates = [
            {
                "type": "date",
                "attribute": "recorded_at",
                "comparison": "lt",
                "value": "now-" + days + "d/d"
            }
        ];

        console.log("Running a search for sessions older than " + days + " days");

        var handler = function(parsed) {
            if (del) {
                delete_response(endpoint, auth, parsed);
            } else {
                list_response(endpoint, parsed);
            }
        };

        // search(endpoint, auth, predicates, handler);
    }

     help() {
        console.log("node index.js --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" --days 30 [--delete]");
        console.log("");
        console.log("Run a search for sessions older than given number of days. By default will only list session urls");
        console.log("to screen. Use --delete to also delete these sessions. Warning: once deleted, a session cannot be");
        console.log("restored from backup.");
        process.exit(0);
    }

    public main () {
        //fetch_sessions();
        var options = commandline_args(options_definitions);

        if (options == {} || options.help) {
            this.help();
        }

        const required = ["endpoint", "user", "api-key", "days"];
        for (var i=0; i<required.length; i++) {
            var k = required[i];
            if (!(k in options)) {
                console.error("Missing value of option \"" + k + "\"");
                help();
            }
        }

        var auth = {
            "user": options["user"],
            "pass": options["api-key"]
        };

        var days = parseInt(options.days);
        if (days <= 0 || isNaN(days)) {
            console.error("Invalid value for 'days' option");
            help();
        }

        var del = false;
        if ("delete" in options) {
            del = true;
            console.log("We will be deleting sessions older than " + days + " days");
        }

        var endpoint = options.endpoint;
        if (endpoint.indexOf(":") >= 0 || endpoint.indexOf("/") >= 0) {
            console.error("Invalid value for option \"endpoint\". Please supply only domain name, for example: \"mycompany.testfairy.com\".");
            help();
        }

        // fetch_sessions(endpoint, auth, days, del);
    }
}

var tool:DeleteOldSessionsTool = new DeleteOldSessionsTool();
tool.main();*/
