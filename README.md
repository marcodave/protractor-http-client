# protractor-http-client
HTTP Client library to use in protractor tests

[![Build Status](https://api.travis-ci.org/marcodave/protractor-http-client.svg?branch=master)](https://travis-ci.org/marcodave/protractor-http-client)

# What this library is about
Are you using [protractor](https://www.npmjs.com/package/protractor) ? me too, and it's awesome! This library is a little utility
that allows you to make any HTTP call (GET, PUT, POST, ...) , leveraging the powerful [request](https://www.npmjs.com/package/request) library.

This library allows you to call HTTP services before, after or during interactions within the browser.

## Why is it useful?
for example, for setting up test data via REST API before a test is run, or cleaning up after a test has finished running.

It won't be easy to do the same with plain 'http' or 'request' module, as you will have to wait for the HTTP
call promise to complete, before using the protractor browser calls.

Instead, you have to just call e.g.
```javascript
http.post("/database/users", {
    username: "marco", password: "bigsecret"
})
browser.get("/login") // this will wait for the previous call to finish
// initiate login with "marco" user
```
and the subsequent calls to protractor API will wait until the previous call finishes.

# Requirements
* Protractor 3+ (tested with 3.3.0 and 4.0.14)
* Node 4.2+

# Usage
If using Javascript specs
```javascript
const HttpClient = require("protractor-http-client").HttpClient
```
If using Typescript specs
```typescript
import {HttpClient} from "protractor-http-client"
```

```typescript
const http = new HttpClient("https://example.com/")

// HTTP GET
const userGetResponse:ResponsePromise = http.get("/users/marco");
// HTTP POST with JSON, automatically sets Content-Type: application/json
http.post("/users", {
    username: "marco", password: "bigsecret"
}));
// HTTP POST, with form data and custom content type
http.post("/form", "param1=value1&param2=value2", {
    "Content-Type": "application/x-www-form-urlencoded"
}));
// make HTTP calls fail and throw an exception when response code is not 2xx
// default behavior is to continue on any HTTP status code
http.failOnError = true
```

You have `get`, `post`, `put`, `delete`, `patch` methods available.
`get` and `delete` methods do NOT accept request body.
For more complex requests, use the `request` method shown below.

## Passing complex request options
You can pass [any options accepted by the request library](https://www.npmjs.com/package/request#requestoptions-callback), by passing an object to the request method
```javascript
let options = { .... }
http.request(options)
```

## HTTP Authentication (from 1.0.5)
Basic Auth
```typescript
let httpClient = new HttpClient(...)
httpClient.withBasicAuth(username, password);
```
Bearer token Auth
```typescript
let httpClient = new HttpClient(...)
httpClient.withBearerToken("token");
```

## Helper methods on response to check status and body
```typescript
let response:ResponsePromise = http.get("/users/marco")
let jsonResponse:JsonPromise = response.jsonBody
let stringBody:Promise<string> = response.stringBody
let rawBody:Promise<Buffer> = response.body

let jsonPropertyValue:JsonPromise = response.jsonBody.get("propertyName")

expect(response.statusCode).toEqual(200)
expect(response.header("Content-Type")).toEqual("application/json")
expect(response.stringBody).toEqual('{"username":"marco","password":"bigsecret"}')
expect(response.jsonBody.get("username")).toEqual("marco")
```

## Registering REST endpoints for enhance test readability (from 1.0.5)
Set up endpoints
```typescript
let httpClient:HttpClient = new HttpClient(...);
let endpoints:HttpEndpoints = new HttpEndpoints(httpClient, {
  getProducts: {
    path: "/products",
    method: "GET"
  },
  getProductById: {
     path: "/products/{id}",
     method: "GET"
  }
  createProduct: {
    path: "/products",
    method: "POST"
  }
});
```
in the test code
```typescript
let productPayload = {....}
let customHeaders = {
    "Content-Type": "application/json",
    ...
}
endpoints.createProduct(null, productPayload, customHeaders);
let response = endpoints.getProductById({id: 500});
```

Additional features:
* keyword parameters substitution anywhere in the URL
* additional parameters are put as request parameters (e.g. `getProducts({page:10})` -> `/products?page=10`)
* passing request body (for POST/PUT calls) as second parameter
* passing custom HTTP headers as optional third parameter

## Example spec with API setup
```javascript
describe("the login page", () => {
    beforeEach(() => {
        // create a user
        const postResponse = http.post("/users", {
            username: "marco", password: "bigsecret"
        });
        expect(postResponse.statusCode).toEqual(200)
    })
    afterEach(() => {
        // delete user
        const deleteResponse = http.delete("/users/marco");
        expect(deleteResponse.statusCode).toEqual(200)
    })

    it("will allow login with new user", () => {
        // now you can use the browser to login with the new user
        browser.get("/login");
        element(by.id("username")).sendKeys("marco")
        element(by.id("password")).sendKeys("bigsecret")
        element(by.id("login-button")).click()
        // expectations here
    })
})
```
