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

	private fetch_sessions(endpoint:string, auth:{user:any; pass:any}, projectId:number) {

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

		var req = request.post("https://"+endpoint+"/api/1/search/", options, function (error: any, response: Response, body: sessionsResponse) {

			console.log("------");

			body = JSON.parse(body);
			console.log(body);
			console.dir(body.total_count);
			console.dir(body.sessions);

			for ( let session of body.sessions) {
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

	private assertNoMissingParams(options:any) {

		if (this.isEmpty(options)|| options.help) {
			this.help();
		}
		
		const required = ["endpoint", "user", "api-key", "project-id"];
		for (var i=0; i<required.length; i++) {
			var k = required[i];
			if (!(k in options)) {
				console.error("Missing value of option \"" + k + "\"");
				this.help();
			}
		}
	}

	private isEmpty(obj:Object) {
		return Object.keys(obj).length === 0;
	}

	private help() {

		console.log("node index.js --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" --days 30 [--delete]");
		console.log("");
		console.log("Run a search for sessions older than given number of days. By default will only list session urls");
		console.log("to screen. Use --delete to also delete these sessions. Warning: once deleted, a session cannot be");
		console.log("restored from backup.");
		process.exit(0);
	}
}

export interface Session {
	url: string;
	email: string;
}
export interface sessionsResponse{
	total_count: number;
	sessions: Session[];
}



new DeleteOldSessionsTool().main();
