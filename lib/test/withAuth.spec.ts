import {HttpClient} from "../http-client";
import {browser} from 'protractor';

describe("Test registeredEndpoints with authentication", function () {

    let http:HttpClient,
        endPoints = {
            getProducts: {
                path: "/products2",
                method: "GET"
            },
            createProduct: {
                path: "/products2",
                method: "POST"
            }
        };
    let expectedResponse = browser.params.db.products2;

    beforeAll(function () {
        http = new HttpClient("http://localhost:5000")
            .registerEndpoints(endPoints);
    });

    let removeAuth = () => {
        http.withNoAuth();
    };

    let addBasicAuth = (username?:string, password?:string) => {
        http.withBasicAuth(username || "sudharsan", password || "sudharsan");
    };

    let addTokenAuth = (token?:string) => {
        http.withBearerToken(token || "eyJhbGciOiJIUzI1NiJ9.c3VkaGFyc2Fu._ujgeT5ySzCByu8zR7GztmDy_QHMGhy1Fdn7fIIf-zk");
    };

    describe("Test GET method", function () {

        it("with no auth", function () {

            removeAuth();
            let actualResponse = http.getProducts();

            //should return 401 when authorization credentials are not provided.
            expect(actualResponse.statusCode).toEqual(401);
            expect(actualResponse.jsonBody.get("message")).toEqual("Error in authorization format");
        });

        it("with invalid username and password", function () {
            addBasicAuth("invalid_user", "invalid_password");
            let actualResponse = http.getProducts();

            //should return 401 when invalid credentials are provided.
            expect(actualResponse.statusCode).toEqual(401);
            expect(actualResponse.jsonBody.get("message")).toEqual("Incorrect username or password");
        });

        it("with valid username and password", function () {
            addBasicAuth();
            let actualResponse = http.getProducts();
            expect(actualResponse.statusCode).toEqual(200);
            expect(actualResponse.jsonBody.get("0")).toEqual(expectedResponse[0]);
            expect(actualResponse.jsonBody.deepGet("1.name")).toEqual(expectedResponse[1].name);
            expect(actualResponse.jsonBody.pluckFromArrayOfObject("name")).toEqual(expectedResponse.map((result:any) => result["name"]));
            expect(actualResponse.jsonBody.getArrayCount()).toEqual(4);

            expect(actualResponse.jsonBody.pluckFromArrayOfObject("locationId").getSortedArray()).toEqual([1, 1, 2, 3]);
            let filterFunction:any = (arr:any):boolean => arr.locationId == 3;
            expect(actualResponse.jsonBody.filterArray(filterFunction)).toEqual(expectedResponse.filter(filterFunction));
        });


        it("with invalid Token", function () {
            addTokenAuth("invalid token");
            let actualResponse = http.getProducts();

            //should return 401 when invalid credentials are provided.
            expect(actualResponse.statusCode).toEqual(401);
            expect(actualResponse.jsonBody.get("message")).toEqual("Invalid acces_token");
        });

        it("with valid Token", function () {
            addTokenAuth();
            let actualResponse = http.getProducts();
            expect(actualResponse.statusCode).toEqual(200);
            expect(actualResponse.jsonBody.get("0")).toEqual(expectedResponse[0]);
            expect(actualResponse.jsonBody.deepGet("1.name")).toEqual(expectedResponse[1].name);
            expect(actualResponse.jsonBody.pluckFromArrayOfObject("name")).toEqual(expectedResponse.map((result:any) => result["name"]));
            expect(actualResponse.jsonBody.getArrayCount()).toEqual(4);

            expect(actualResponse.jsonBody.pluckFromArrayOfObject("locationId").getSortedArray()).toEqual([1, 1, 2, 3]);
            let filterFunction:any = (arr:any):boolean => arr.locationId == 3;
            expect(actualResponse.jsonBody.filterArray(filterFunction)).toEqual(expectedResponse.filter(filterFunction));
        });


    });


    describe("Test POST method", function () {

        let payload = {
                "id": 10,
                "name": "Product001",
                "cost": 10,
                "quantity": 1000,
                "locationId": 1,
                "familyId": 1
            },
            actualResponse;
        
        
        it("with no auth", function () {

            removeAuth();
            actualResponse = http.createProduct(null, payload);

            //should return 401 when authorization credentials are not provided.
            expect(actualResponse.statusCode).toEqual(401);
            expect(actualResponse.jsonBody.get("message")).toEqual("Error in authorization format");
        });

        it("with invalid username and password", function () {
            addBasicAuth("invalid_user", "invalid_password");
            actualResponse = http.createProduct(null, payload);

            //should return 401 when invalid credentials are provided.
            expect(actualResponse.statusCode).toEqual(401);
            expect(actualResponse.jsonBody.get("message")).toEqual("Incorrect username or password");
        });

        it("with valid username and password", function () {
            addBasicAuth();

            actualResponse = http.createProduct(null, payload);

            expect(actualResponse.statusCode).toEqual(201);
            expect(actualResponse.jsonBody).toEqual(payload);
            expect(actualResponse.header("Content-Type")).toContain("application/json");
        });


        it("with invalid Token", function () {
            addTokenAuth("invalid token");
            actualResponse = http.createProduct(null, payload);

            //should return 401 when invalid credentials are provided.
            expect(actualResponse.statusCode).toEqual(401);
            expect(actualResponse.jsonBody.get("message")).toEqual("Invalid acces_token");
        });

        it("with valid Token", function () {
            addTokenAuth();
            actualResponse = http.createProduct(null, payload);
            payload.id = payload.id + 1;
            expect(actualResponse.statusCode).toEqual(201);
            expect(actualResponse.jsonBody).toEqual(payload);
            expect(actualResponse.header("Content-Type")).toContain("application/json");
        });


    });

});