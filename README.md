# TestFairy Fetch Sessions tool

#### About

This tool downloads screenshots and/or logs from recorded TestFairy sessions. Use this to download data to analyze with your own toolchain or to import to your own analytics systems.

#### Installation

```
npm install -g --link git+https://github.com/testfairy/testfairy-fetch-sessions.git
```

If you receive the error: "Could not create leading directories", then you should run the same command with `sudo -s` prefix.

#### Usage

```
testfairy-fetch-sessions --endpoint "acme.testfairy.com" --user "john@example.com" --api-key "0123456789abcdef" --project-id=1000 --logs --screenshots --video
```

The example above would connect to endpoint `acme.testfairy.com` (which be a private cloud installation, a public cloud installation, or an on-premise installation.) It will use the credentials of user and api-key.

Since both `--logs` and `--screenshots` are provided, the tool will download all screenshots and all logs from app's project `1000`. You can find the id of the project (app) you want to download by examining the url (for example: https://app.testfairy.com/projects/1000/)

You can create an MP4 video using all the downloaded screenshots by passing in `--video` along with `--screenshots`.

If your logs are encrypted, you can download encrypted logs with the argument `--rsa-private-key` along with the path to the RSA Private Key PEM file. See [docs](https://docs.testfairy.com/Security/End_to_End_Data_Encryption.html) for more information on security.

TestFairy Fetch Sessions tool is incremental in downloads. This means that you can run the tool multiple times, and it will only download new sessions that were recorded.

#### Support

Got a question? We're always eager to help. We're available at <a href="mailto:support@testfairy.com">support@testfairy.com</a>.
