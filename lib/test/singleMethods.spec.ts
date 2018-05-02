import {HttpClient} from "../http-client";
import { protractor, browser } from "protractor";

describe("Webdriver HTTP client", () => {
    
    it("can perform a GET", () => {
        const http:HttpClient = new HttpClient("https://httpbin.org");

        const response = http.get("/get?param=value");
        expect(response.statusCode).toBe(200);
        expect(response.body).toContain("\"param\": \"value\"");
        expect(response.jsonBody.get("args").get("param")).toEqual("value");
    });

    it("can perform a POST", () => {
        const http:HttpClient = new HttpClient("https://httpbin.org");

        let response = http.post("/post", "param1=value1&param2=value2", {
            "Content-Type": "application/x-www-form-urlencoded"
        });
        expect(response.statusCode).toBe(200);
        expect(response.header("Content-Type")).toEqual("application/json");
        expect(response.jsonBody.get("form").get("param1")).toEqual("value1");
        expect(response.jsonBody.get("form").get("param2")).toEqual("value2");

        response = http.post("/post", {
            my: { nice: ["json", "object"]}
        });
        expect(response.statusCode).toBe(200);
        expect(response.header("Content-Type")).toEqual("application/json");
        expect(response.jsonBody.get("json").get("my").get("nice").get(0)).toEqual("json");
    });

    
    it("can perform a PUT", () => {
        const http:HttpClient = new HttpClient("https://httpbin.org");

        let response = http.put("/put", "param1=value1&param2=value2", {
            "Content-Type": "application/x-www-form-urlencoded"
        });
        expect(response.statusCode).toBe(200);
        expect(response.header("Content-Type")).toEqual("application/json");
        expect(response.jsonBody.get("form").get("param1")).toEqual("value1");
        expect(response.jsonBody.get("form").get("param2")).toEqual("value2");
    });
    
    it("can perform a DELETE", () => {
        const http:HttpClient = new HttpClient("https://httpbin.org");

        let response = http.delete("/delete", {
            "X-Custom": "value"
        });
        expect(response.statusCode).toBe(200);
        expect(response.jsonBody.get("headers").get("X-Custom")).toEqual("value");
    });
    
    it("can fail when gets a non 2xx status code", () => {
        const http:HttpClient = new HttpClient("https://httpbin.org");
        let response = http.get("/status/404");
        expect(response.statusCode).toBe(404);

        http.failOnHttpError = true;
        http.get("/status/404").catch((error) => {
            expect(error).toBe("request returned status code of 404 and body ");
        });
        http.get("/status/500").catch((error) => {
            expect(error).toBe("request returned status code of 500 and body ");
        });
        http.get("/unknown").catch((error) => {
            expect(error).toContain("request returned status code of 404 and body <!DOCTYPE HTML");
        });
        expect(http.get("/status/201").statusCode).toBe(201);
        expect(http.get("/status/299").statusCode).toBe(299);
    });
});
