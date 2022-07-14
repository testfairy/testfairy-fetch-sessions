"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessions = exports.makeProjectPredicates = exports.assertNoMissingParams = exports.getRsaEncryptionKey = exports.isEmpty = exports.getEndpoint = void 0;
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
const thisMonthString = () => {
    const date = new Date();
    const month = date.getUTCMonth() + 1;
    const monthAsString = (month < 10) ? "0" + month.toString() : month.toString();
    const year = date.getUTCFullYear();
    return `${year}-${monthAsString}-01`;
};
exports.makeProjectPredicates = (options) => {
    const predicates = [{
            "type": "number",
            "attribute": "project_id",
            "comparison": "eq",
            "value": options.projectId()
        }];
    if (!options.contains('all-time')) {
        const value = options.contains("this-month") ? thisMonthString() : "now-24h/h";
        predicates.push({
            "type": "date",
            "attribute": "recorded_at",
            "comparison": "gt",
            value
        });
    }
    return predicates;
};
const searchSessions = (predicates, options) => __awaiter(void 0, void 0, void 0, function* () {
    const endpoint = options.key('endpoint');
    const auth = options.auth();
    const url = `https://${endpoint}/api/1/search/`;
    return new Promise((resolve, reject) => {
        const httpOptions = { auth };
        let option = Object.assign(Object.assign({}, httpOptions), {
            form: {
                "per_page": 1000,
                "predicates": JSON.stringify(predicates),
                "fields": "url,recorded_at,app_name,app_version,app_version_code,attributes4,device_maker,device_model,ip,os_version,email,device_screen_height,device_screen_width,platform"
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
const fetchSessionData = (session, options) => __awaiter(void 0, void 0, void 0, function* () {
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
                    const data = Object.assign(Object.assign({}, response.session), { url: session.url, recordedAt: new Date(session.recorded_at), appName: session.app_name, appVersion: session.app_version, appVersionCode: session.app_version_code, attributes: session.attributes4, userId: session.email, deviceMaker: session.device_maker, deviceModel: session.device_model, ipAddress: session.ip, osVersion: session.os_version, platform: session.platform, deviceScreenHeight: session.device_screen_height, deviceScreenWidth: session.device_screen_width });
                    resolve(data);
                }
                catch (exception) {
                    reject(exception);
                }
            }
        });
    });
});
exports.sessions = (predicates, options) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionData = yield searchSessions(predicates, options);
    if (sessionData.status === 'fail') {
        throw new Error(sessionData.message);
    }
    console.log("Found " + sessionData.sessions.length + " sessions, now fetching contents");
    const events = sessionData.sessions.map((session) => {
        return fetchSessionData(session, options);
    });
    return Promise.all(events);
});
//# sourceMappingURL=helpers.js.map