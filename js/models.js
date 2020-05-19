"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const commandline_args = require('command-line-args');
class Options {
    constructor(definitions) {
        this.options = commandline_args(definitions);
    }
    containsHelp() {
        return helpers_1.isEmpty(this.options) || this.options.help;
    }
    contains(key) {
        return this.options[key] !== undefined;
    }
    key(name) {
        helpers_1.assertNoMissingParams(this.options, [name]);
        return this.options[name];
    }
    auth() {
        const auth = {
            "user": this.key("user"),
            "pass": this.key("api-key")
        };
        return auth;
    }
    endpoint() {
        return this.key('endpoint');
    }
    projectId() {
        return this.key('project-id');
    }
}
exports.Options = Options;
//# sourceMappingURL=models.js.map