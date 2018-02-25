import { Config } from "protractor";

export let config:Config = {
    specs: ["test/tests.js"],
    directConnect: true,
    capabilities: {
        browserName: "chrome"
    }
};
