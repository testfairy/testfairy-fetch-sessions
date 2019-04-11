# TestFairy Fetch Sessions tool

#### About
 
This tool downloads screenshots and/or logs from recorded TestFairy sessions. Use this to download data to analyze with your own toolchain or to import to your own analytics systems.

#### Installation

```
npm install -g --link git+ssh://git@github.com:testfairy/testfairy-fetch-sessions.git
```

#### Usage

```
testfairy-fetch-sessions --endpoint "acme.testfairy.com" --user "john@example.com" --api-key "0123456789abcdef" --project-id=1000 --logs --screenshots
```

The example above would connect to endpoint `acme.testfairy.com` (which be a private cloud installation, a public cloud installation, or an on-premise installation.) It will use the credentials of user and api-key.

Since both `--logs` and `--screenshots` are provided, the tool will download all screenshots and all logs from app's project `1000`. You can find the id of the project (app) you want to download by examining the url (for example: https://app.testfairy.com/projects/1000/)

TestFairy Fetch Sessions tool is incremental in downloads. This means that you can run the tool multiple times, and it will only download new sessions that were recorded.

#### Support

Got a question? We're always eager to help. We're available at <a href="mailto:support@testfairy.com">support@testfairy.com</a>.

