// lib/app.ts
import { Options } from "./models";
import { sessions as fetchSessions, makeProjectPredicates } from "./helpers";
import { logs } from "./logs";
import { screenshots } from "./screenshots";

const console_stamp = require('console-stamp');

const options_definitions = [
	{name: 'help', alias: 'h', type: Boolean},
	{name: 'project-id', type: Number},
	{name: 'user', type: String},
	{name: 'api-key', type: String},
	{name: 'endpoint', type: String},
	{name: 'rsa-private-key', type: String},
	{name: 'logs'},
	{name: 'screenshots'},
	{name: 'video'}
];

console_stamp(console, 'HH:MM:ss.l');

class SessionsTool {
	async run() {
		const options = new Options(options_definitions);
		if (options.containsHelp()) {
			this.help();
		}

		const predicates = makeProjectPredicates(options);
		const sessions = await fetchSessions(predicates, options);
		if (options.contains('logs')) {
			await logs(sessions, options);
		}

		if (options.contains('screenshots') || options.contains('video')) {
			await screenshots(sessions, options);
		}
	}

	help() {
		console.log("Usage: fetch-sessions-tool --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" --project-id=1000 [--logs] [--screenshots] [--video] [--rsa-private-key <path to RSA Private Key PEM file>]");
		console.log("");
		console.log("This tool downloads screenshots and/or logs from recorded TestFairy sessions. Use this to download data to analyze");
		console.log("sessions with your own toolchain or to import to your own analytics systems.");
		process.exit(1);
	}
}

const tool = new SessionsTool();
tool.run().catch((error: Error) => { console.error(error.message); tool.help(); })
