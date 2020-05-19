const aesjs = require('aes-js');

export class ArrayBufferUtils {
	static base64ToArrayBuffer(input: string): Uint8Array {
		const raw = Buffer.from(input, 'base64').toString('binary');
		const array = new Uint8Array(new ArrayBuffer(raw.length));

		for (let i = 0; i < raw.length; i++) {
			array[i] = raw.charCodeAt(i);
		}

		return array;
	}
}

export class AESEncryption {
	/**
	 * Constructs an AES descryptor instance. Currently supports 128 bit AES only.
	 *
	 * @param key
	 * @param iv
	 */
	private key: Uint8Array;
	private iv: Uint8Array;

	constructor(key: string, iv: string) {
		this.key = ArrayBufferUtils.base64ToArrayBuffer(key);
		this.iv = ArrayBufferUtils.base64ToArrayBuffer(iv);
	}

	/**
	 * Decrypts an input string that is encoded in base64. Returns a utf-8 string.
	 *
	 * @param input
	 * @return string
	 */
	decryptString(input: string): string {
		const aesCbc = new aesjs.ModeOfOperation.cbc(this.key, this.iv);
		return aesjs.utils.utf8.fromBytes(aesCbc.decrypt(ArrayBufferUtils.base64ToArrayBuffer(input)));
	}

	/**
	 * Decrypts an input array buffer.
	 *
	 * @param input
	 * @return Uint8Array
	 */
	decrypt(input: Uint8Array): Uint8Array {
		const aesCbc = new aesjs.ModeOfOperation.cbc(this.key, this.iv);
		return aesCbc.decrypt(input);
	}
}
