import { Config } from "protractor";

export let config:Config = {
    specs: ["tests.js"],
    capabilities: {
        browserName: "phantomjs",
        'phantomjs.binary.path': require('phantomjs-prebuilt').path,
        'phantomjs.cli.args': ['--remote-debugger-port=8081'],
        'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG'],
    }
};
