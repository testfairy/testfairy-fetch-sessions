"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AESEncryption = exports.ArrayBufferUtils = void 0;
const aesjs = require('aes-js');
class ArrayBufferUtils {
    static base64ToArrayBuffer(input) {
        const raw = Buffer.from(input, 'base64').toString('binary');
        const array = new Uint8Array(new ArrayBuffer(raw.length));
        for (let i = 0; i < raw.length; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    }
}
exports.ArrayBufferUtils = ArrayBufferUtils;
class AESEncryption {
    constructor(key, iv) {
        this.key = ArrayBufferUtils.base64ToArrayBuffer(key);
        this.iv = ArrayBufferUtils.base64ToArrayBuffer(iv);
    }
    /**
     * Decrypts an input string that is encoded in base64. Returns a utf-8 string.
     *
     * @param input
     * @return string
     */
    decryptString(input) {
        const aesCbc = new aesjs.ModeOfOperation.cbc(this.key, this.iv);
        return aesjs.utils.utf8.fromBytes(aesCbc.decrypt(ArrayBufferUtils.base64ToArrayBuffer(input)));
    }
    /**
     * Decrypts an input array buffer.
     *
     * @param input
     * @return Uint8Array
     */
    decrypt(input) {
        const aesCbc = new aesjs.ModeOfOperation.cbc(this.key, this.iv);
        return aesCbc.decrypt(input);
    }
}
exports.AESEncryption = AESEncryption;
//# sourceMappingURL=aes-encryption.js.map