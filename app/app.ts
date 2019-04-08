// lib/app.ts
import {Sessions} from "./sessions";
import {Auth} from "./auth";
const console_stamp = require('console-stamp');
const commandline_args = require('command-line-args');

const options_definitions = [
	{ name: 'help', alias: 'h', type: Boolean },
	{ name: 'project-id', type: Number },
	{ name: 'user', type: String },
	{ name: 'api-key', type: String },
	{ name: 'endpoint', type: String },
	{ name: 'logs'},
	{ name: 'screenshots'},
];

console_stamp(console, 'HH:MM:ss.l');

class SessionsTool {

	private sessions: Sessions;

	constructor(private options:any) {


		let auth : Auth = {
			"user": options["user"],
			"pass": options["api-key"]
		};

		this.sessions = new Sessions(options['endpoint'], options['project-id'], auth);

	}

	run() {

		if (this.options['logs'] !== undefined) {
			this.sessions.logs();
		}

		if (this.options['screenshots'] !== undefined) {
			this.sessions.screenshots();
		}
	}
}

function isEmpty(obj:Object) {
	return Object.keys(obj).length === 0;
}

function help() {

	console.log("node index.js --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" --days 30 [--delete]");
	console.log("");
	console.log("Run a search for sessions older than given number of days. By default will only list session urls");
	console.log("to screen. Use --delete to also delete these sessions. Warning: once deleted, a session cannot be");
	console.log("restored from backup.");
	process.exit(0);
}

function assertNoMissingParams(options:any) {

	if (isEmpty(options) || options.help) {
		help();
	}

	const required = ["endpoint", "user", "api-key", "project-id"];
	for (var i=0; i<required.length; i++) {
		var k = required[i];
		if (!(k in options)) {
			console.error("Missing value of option \"" + k + "\"");
			help();
		}
	}
}

let options = commandline_args(options_definitions);
assertNoMissingParams(options);

var endpoint = options.endpoint;
if (endpoint.indexOf(":") >= 0 || endpoint.indexOf("/") >= 0) {
	console.error("Invalid value for option \"endpoint\". Please supply only domain name, for example: \"mycompany.testfairy.com\".");
	help();
}
new SessionsTool(options).run();