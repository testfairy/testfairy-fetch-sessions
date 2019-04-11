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

	static main() {
		const tool = new SessionsTool();
		tool.run();
	}

	private run() {
		const options = commandline_args(options_definitions);
		this.assertNoMissingParams(options);

		const endpoint = options.endpoint;
		if (endpoint.indexOf(":") >= 0 || endpoint.indexOf("/") >= 0) {
			console.error("Invalid value for option \"endpoint\". Please supply only domain name, for example: \"mycompany.testfairy.com\".");
			this.help();
		}

		const auth: Auth = {
			"user": options["user"],
			"pass": options["api-key"]
		};

		const sessions: Sessions = new Sessions(options['endpoint'], options['project-id'], auth);

		if (options['logs'] !== undefined) {
			sessions.logs();
		}

		if (options['screenshots'] !== undefined) {
			sessions.screenshots();
		}
	}

	private isEmpty(obj:Object) {
		return Object.keys(obj).length === 0;
	}

	private help() {
		console.log("Usage: fetch-sessions-tool --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" [--logs] [--screenshots]");
		console.log("");
		console.log("This tool downloads screenshots and/or logs from recorded TestFairy sessions. Use this to download data to analyze");
		console.log("with your own toolchain or to import to your own analytics systems.");
		process.exit(1);
	}

	private assertNoMissingParams(options:any) {

		if (this.isEmpty(options) || options.help) {
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

		if (!options.logs && !options.screenshots) {
			console.error("Must provide at least of --logs or --screenshots");
			this.help();
		}
	}

}

SessionsTool.main();

