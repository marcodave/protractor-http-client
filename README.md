# protractor-http-client
HTTP Client library to use in protractor tests

# What this library is about
Are you using protractor ? me too, and it's awesome! This library is a little utility
that allows you to make any HTTP call (GET, PUT, POST, ...) , leveraging the powerful request library.
This library allows you to call HTTP services before, after or during interactions within the browser.

## Why is it useful?
for example, for setting up test data via REST API before a test is run, or cleaning up after a test has finished running.
It's much better than using plain HTTP calls with Node, as you have to just call e.g.
```javascript
http.post("/database/users", {
    username: "marco", password: "bigsecret"
})
```
and the subsequent calls to protractor API will wait until the previous call finishes.

# Requirements
* Protractor 3+ (tested with 3.3.0 and 4.0.14)
* Node 4.2+

# Usage
Within a protractor test.js spec file, write
```javascript
const HttpClient = require("protractor-http-client").HttpClient

const http = new HttpClient("https://example.com/")

// HTTP GET
const userGetResponse = http.get("/users/marco");
// HTTP POST, with JSON body
// create a user
const userGetResponse = http.post("/users", {
    username: "marco", password: "bigsecret"
});

// now you can use the browser to login with the new user
browser.get("/login");
element(by.id("username")).sendKeys("marco")
element(by.id("password")).sendKeys("bigsecret")
element(by.id("login-button")).click()
```

You have `get`, `post`, `put`, `delete` available.
`get` and `delete` methods do NOT accept request body.
For more complex requests, use the `request` method shown below.

## Passing complex request options
You can pass any options accepted by the request library, by passing an object to the request method
```javascript
let options = { .... }
http.request(options)
```