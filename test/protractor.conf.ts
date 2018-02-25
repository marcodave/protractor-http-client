import { Config } from "protractor";

export let config:Config = {
    specs: ["tests.js"],
    directConnect: true,
    capabilities: {
        browserName: "chrome"
    }
};
