// lib/app.ts
import {Sessions} from "./sessions";
import {Auth} from "./auth";
import {Video} from "./commands/video";

const console_stamp = require('console-stamp');
const commandline_args = require('command-line-args');

const options_definitions = [
	{name: 'help', alias: 'h', type: Boolean},
	{name: 'project-id', type: Number},
	{name: 'user', type: String},
	{name: 'api-key', type: String},
	{name: 'endpoint', type: String},
	{name: 'logs'},
	{name: 'screenshots'},
	{name: 'sessions', multiple: true}
];

console_stamp(console, 'HH:MM:ss.l');

class SessionsTool {

	static main() {
		const tool = new SessionsTool();
		tool.run();
	}

	private run() {
		const options = commandline_args(options_definitions);
		this.assertNoMissingParams(options, ["user", "api-key"]);
		const auth: Auth = {
			"user": options["user"],
			"pass": options["api-key"]
		};

		if (options['logs'] !== undefined) {
			this.assertNoMissingParams(options, ["project-id", "endpoint"]);

			const predicates: [any] = [{
				"type": "number",
				"attribute": "project_id",
				"comparison": "eq",
				"value": options['project-id']
			}];
			const sessions: Sessions = new Sessions(this.getEndpoint(options), auth);
			sessions.logs(predicates);
		}

		if (options['screenshots'] !== undefined) {
			this.assertNoMissingParams(options, ["project-id", "endpoint"]);

			const predicates: [any] = [{
				"type": "number",
				"attribute": "project_id",
				"comparison": "eq",
				"value": options['project-id']
			}];
			const sessions: Sessions = new Sessions(this.getEndpoint(options), auth);
			sessions.screenshots(predicates);
		}

		if (options['sessions'] !== undefined) {
			new Video().run(auth, options);
		}
	}

	private isEmpty(obj: Object) {
		return Object.keys(obj).length === 0;
	}

	private help() {
		console.log("Usage: fetch-sessions-tool --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" [--logs] [--screenshots] [--sessions <list of session urls>]");
		console.log("");
		console.log("This tool downloads screenshots and/or logs from recorded TestFairy sessions. Use this to download data to analyze");
		console.log("with your own toolchain or to import to your own analytics systems.");
		process.exit(1);
	}

	private getEndpoint(options: any) {
		const endpoint = options.endpoint;
		if (endpoint.indexOf(":") >= 0 || endpoint.indexOf("/") >= 0) {
			console.error("Invalid value for option \"endpoint\". Please supply only domain name, for example: \"mycompany.testfairy.com\".");
			this.help();
		}

		return endpoint;
	}

	private assertNoMissingParams(options: any, required: string[]) {
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

