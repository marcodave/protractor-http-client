import {HttpClient} from "../lib/http-client";
import { protractor, browser } from "protractor";

describe("Webdriver HTTP client", () => {
    
    it("can perform a GET", () => {
        const http:HttpClient = new HttpClient("https://httpbin.org");

        const response = http.get("/get?param=value");
        expect(response.statusCode).toBe(200);
        expect(response.body).toContain("\"param\": \"value\"");
    });

    it("can fail when gets a 404", () => {
        const http:HttpClient = new HttpClient("https://httpbin.org");
        let response = http.get("/status/404");
        expect(response.statusCode).toBe(404);
        
        http.failOnHttpError = true;
        http.get("/status/404").catch((error) => {
            expect(error).toBe("request returned 404");
        });
    });
});
