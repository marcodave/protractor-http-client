import {Config} from "protractor";

export let config:Config = {
    specs: ["singleMethods.spec.js", "noAuth.spec.js", "withAuth.spec.js"],
    jasmineNodeOpts: {
        defaultTimeoutInterval: 120000
    },
    capabilities: {
        browserName: "phantomjs",
        'phantomjs.binary.path': require('phantomjs-prebuilt').path,
        'phantomjs.cli.args': ['--remote-debugger-port=8081'],
        'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG'],
    },
    params: {
        db: require("../../server/database.json")
    }
};
