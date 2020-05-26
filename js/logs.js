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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
exports.logs = void 0;
const fs = __importStar(require("fs"));
const helpers_1 = require("./helpers");
const aes_encryption_1 = require("./aes-encryption");
const sprintf = require('sprintf-js').sprintf;
const save = (log, logFilePath, dirPath) => {
    if (log == null) {
        return;
    }
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Saving session log to ${logFilePath}`);
    fs.writeFileSync(logFilePath, log);
};
const convert = (data, rsa) => {
    if (!data || !data.events) {
        return null;
    }
    let logs = data.events.encryptedLogs || data.events.logs || [];
    const key = data.events.meta.find(meta => meta.type === 28);
    if (data.events.encryptedLogs && rsa && key) {
        const aesKey = key;
        const keyDecrypt = rsa.decrypt(aesKey.aesKey, "utf8");
        const ivDecrypt = rsa.decrypt(aesKey.aesIv, "utf8");
        const aes = new aes_encryption_1.AESEncryption(keyDecrypt, ivDecrypt);
        logs.forEach(log => log.text = aes.decryptString(log.text));
    }
    const output = logs.map(log => {
        const logTs = Math.max(0, log.ts);
        const recordedAt = new Date(data.recordedAt);
        recordedAt.setTime(data.recordedAt.getTime() + logTs);
        const mmss = recordedAt.toISOString();
        return `${mmss} ${log.level}/${log.tag} ${log.text}`.trim();
    }).join("\n");
    return output;
};
exports.logs = (sessions, options) => __awaiter(void 0, void 0, void 0, function* () {
    const rootPath = "testfairy-sessions";
    const encrypt = helpers_1.getRsaEncryptionKey(options);
    sessions.forEach(session => {
        const dirPath = rootPath + session.url;
        const logFilePath = `${dirPath}/session.log`;
        if (fs.existsSync(logFilePath)) {
            console.log(logFilePath + " already exists");
            return;
        }
        const logs = convert(session, encrypt);
        save(logs, logFilePath, dirPath);
    });
});
//# sourceMappingURL=logs.js.map