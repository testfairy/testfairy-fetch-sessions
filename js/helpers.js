"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const request = require('request');
const NodeRSA = require('node-rsa');
exports.getEndpoint = (options) => {
    const endpoint = options.endpoint();
    if (endpoint.indexOf(":") >= 0 || endpoint.indexOf("/") >= 0) {
        throw new Error("Invalid value for option \"endpoint\". Please supply only domain name, for example: \"mycompany.testfairy.com\".");
    }
    return endpoint;
};
exports.isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};
exports.getRsaEncryptionKey = (options) => {
    if (!options.contains('rsa-private-key')) {
        return null;
    }
    const rsaPrivateKeyFilePath = options.key('rsa-private-key');
    if (!fs.existsSync(rsaPrivateKeyFilePath)) {
        throw new Error(`RSA private key file (${rsaPrivateKeyFilePath}) does not exist.`);
    }
    const rsaPrivateKey = fs.readFileSync(rsaPrivateKeyFilePath, { encoding: 'utf8' });
    const rsa = new NodeRSA(rsaPrivateKey, 'pkcs1-private-pem', { encryptionScheme: 'pkcs1' });
    return rsa;
};
exports.assertNoMissingParams = (options, required) => {
    for (var i = 0; i < required.length; i++) {
        var k = required[i];
        if (!(k in options)) {
            throw new Error("Missing value of option \"" + k + "\"");
        }
    }
    if (!("logs" in options) && !("screenshots" in options) && !("video" in options)) {
        throw new Error("Must provide at least one of --logs, --screenshots or --video");
    }
};
exports.makeProjectPredicates = (options) => {
    return [{
            "type": "number",
            "attribute": "project_id",
            "comparison": "eq",
            "value": options.projectId()
        }];
};
const fetchSessionUrls = (predicates, options) => __awaiter(this, void 0, void 0, function* () {
    const endpoint = options.key('endpoint');
    const auth = options.auth();
    const url = `https://${endpoint}/api/1/search/`;
    return new Promise((resolve, reject) => {
        const httpOptions = { auth };
        let option = Object.assign({}, httpOptions, {
            form: {
                "predicates": JSON.stringify(predicates),
                "fields": "url"
            }
        });
        const callback = (error, response, body) => {
            if (error) {
                reject(error);
            }
            else {
                try {
                    resolve(JSON.parse(body.toString()));
                }
                catch (exception) {
                    reject(exception);
                }
            }
        };
        request.post(url, option, callback);
    });
});
const fetchSessionEvents = (session, options) => __awaiter(this, void 0, void 0, function* () {
    const endpoint = options.key('endpoint');
    const auth = options.auth();
    const url = `https://${endpoint}/api/1${session.url}?fields=events`;
    return new Promise((resolve, reject) => {
        const httpOptions = { auth };
        request.get(url, httpOptions, (error, res, body) => {
            if (error) {
                reject(error);
            }
            else {
                try {
                    const response = JSON.parse(body.toString());
                    const data = Object.assign({}, response.session, { url: session.url });
                    resolve(data);
                }
                catch (exception) {
                    reject(exception);
                }
            }
        });
    });
});
exports.sessions = (predicates, options) => __awaiter(this, void 0, void 0, function* () {
    const sessionUrls = yield fetchSessionUrls(predicates, options);
    let events = sessionUrls.sessions.map((session) => {
        return fetchSessionEvents(session, options);
    });
    return Promise.all(events);
});
//# sourceMappingURL=helpers.js.map