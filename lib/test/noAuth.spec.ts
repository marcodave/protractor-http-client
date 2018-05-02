import {HttpClient} from "../http-client";
import {browser} from "protractor";

describe("Test registeredEndpoints with no authentication", function () {

    let http:HttpClient,
        endPoints = {
            getProducts: {
                path: "/no-auth/products1",
                method: "GET"
            },
            getProductById: {
                path: "/no-auth/products1/{id}",
                method: "GET"
            },
            createProduct: {
                path: "/no-auth/products1",
                method: "POST"
            },
            updateProductUsingPut: {
                path: "/no-auth/products1/{id}",
                method: "PUT"
            },
            updateProductUsingPatch: {
                path: "/no-auth/products1/{id}",
                method: "PATCH"
            },
            deleteProduct: {
                path: "/no-auth/products1/{id}",
                method: "DELETE"
            }
        };
    let expectedResponse = browser.params.db.products1;
    
    beforeAll(function () {
        http = new HttpClient("http://localhost:5000")
            .registerEndpoints(endPoints);
    });

    it("Test GET method", function () {
        let actualResponse = http.getProducts();

        expect(actualResponse.statusCode).toEqual(200);
        expect(actualResponse.jsonBody.get("0")).toEqual(expectedResponse[0]);
        // deepGet("1.name") will return the name of first object from the response array.
        expect(actualResponse.jsonBody.deepGet("1.name")).toEqual(expectedResponse[1].name);
        // pluckFromArrayOfObject("name") will return the names of all object from the response array.
        expect(actualResponse.jsonBody.pluckFromArrayOfObject("name")).toEqual(expectedResponse.map((result:any) => result["name"]));
        // getArrayCount() will return the count of total records from the response array.
        expect(actualResponse.jsonBody.getArrayCount()).toEqual(4);

        expect(actualResponse.jsonBody.pluckFromArrayOfObject("locationId").getSortedArray()).toEqual([1, 1, 2, 3]);
        let filterFunction:any = (arr:any):boolean => arr.locationId == 3;
        // filterArray() will return all matching records with "locationId = 3" from the response array.
        expect(actualResponse.jsonBody.filterArray(filterFunction)).toEqual(expectedResponse.filter(filterFunction));
    });

    it("Test GET method with wildcard url", function () {
        let actualResponse = http.getProductById({id: 2});

        expect(actualResponse.jsonBody).toEqual(expectedResponse[1]);
    });

    it("Test POST method without \"Content-Type\"", function () {
        let payload = {
                "id": 5,
                "name": "Product001",
                "cost": 10,
                "quantity": 1000,
                "locationId": 1,
                "familyId": 1
            },
            actualResponse = http.createProduct(null, payload);

        expect(actualResponse.statusCode).toEqual(201);
        expect(actualResponse.jsonBody).toEqual(payload);
        expect(actualResponse.header("Content-Type")).toContain("application/json");
    });

    it("Test POST method with \"Content-Type\"", function () {
        let payload = {
                "id": 6,
                "name": "Product001",
                "cost": 10,
                "quantity": 1000,
                "locationId": 1,
                "familyId": 1
            },
            actualResponse = http.createProduct(null, payload, {
                "Content-Type": "application/json"
            });

        expect(actualResponse.statusCode).toEqual(201);
        expect(actualResponse.jsonBody).toEqual(payload);
        expect(actualResponse.header("Content-Type")).toContain("application/json");
    });

    it("Test PUT method", function () {
        let payload = {
                "id": 1,
                "name": "Product001Edited",
                "cost": 100,
                "quantity": 10000,
                "locationId": 12,
                "familyId": 11
            },
            actualResponse = http.updateProductUsingPut({id: 1}, payload);

        expect(actualResponse.statusCode).toEqual(200);
        expect(actualResponse.jsonBody).toEqual(payload);
        expect(actualResponse.header("Content-Type")).toContain("application/json");
    });

    it("Test PATCH method", function () {
        let payload = {
                "cost": 0,
                "quantity": 0,
            },
            actualResponse = http.updateProductUsingPatch({id: 2}, payload);

        expectedResponse[1].cost = payload.cost;
        expectedResponse[1].quantity = payload.quantity;

        expect(actualResponse.statusCode).toEqual(200);
        expect(actualResponse.jsonBody).toEqual(expectedResponse[1]);
        expect(actualResponse.header("Content-Type")).toContain("application/json");
    });

    it("Test DELETE method", function () {

        let deleteResponse = http.deleteProduct({id: 2});
        let productList = http.getProducts();

        expect(deleteResponse.statusCode).toEqual(200);
        expect(deleteResponse.jsonBody).toEqual({});
        expect(productList.jsonBody.pluckFromArrayOfObject("id")).not.toContain(2);
    });

});