import { HttpClient } from "./http-client";
import {ResponsePromise} from "./promisewrappers";

export interface EndPointTemplate {
    [key:string]:{
        "path":string,
        "method":string,
        "headers"?:any,
    }
}

export class HttpEndpoints {

    private client:HttpClient;
    private endPoints:EndPointTemplate;
    [key:string]:any; //index signature for accessing dynamically generated methods from test.

    constructor(client:HttpClient,endpoints:EndPointTemplate) {
        this.client = client;
        this.endPoints = endpoints;
        this.registerEndpoints(this.endPoints);
    }

    /**
     *
     * Method used to generate predefined reusable methods for given set of endpoints.
     *
     * Example:
     *
     * let endpoints =  {
     *      getPosts : {
     *          path : "/posts",
     *          "methods" : "GET"
     *      }
     *  }
     *
     * Below method will create a dynamic function in HttpClient prototype with name "getPosts"
     * and the method can be directly called from test like `http.getPosts()`.
     *
     * @param endpoints
     * @returns {HttpClient}
     */

   public registerEndpoints(endpoints:EndPointTemplate):HttpEndpoints {
        let self:HttpEndpoints = this;
        Object.keys(endpoints).forEach(function (endPointName:string) {
            var endPointDetails = endpoints[endPointName];
            HttpEndpoints.prototype[endPointName] = function (parameters?:any, body?:any, headers?:any):ResponsePromise {
                //parse wildcard routes before making API call.
                let parsedUrl = HttpEndpoints.parseWildCardRoutes(endPointDetails.path, parameters || {});
                return self.client.send(endPointDetails.method, parsedUrl, body, endPointDetails.headers || headers);
            }
        });
        return this;
    }

    /**
     *
     * Method to convert wildcard routes with their respective values.
     *
     * Example 1:
     * let path = "/products/{productId}";
     * let wildcardParam = { productId : 1 };
     *
     * OUTPUT: "/products/1"
     *
     * Example 2:
     *
     * If the path doesn't have any wildcard pattern, then this method will append parameter as url-encoded-form.
     *
     * let path = "/products";
     * let wildcardParam = { productId : 1 };
     *
     * OUTPUT: "/products?productId=1"
     *
     * @param path
     * @param wildcardParam
     * @returns {string}
     */
    private static parseWildCardRoutes(path:string, wildcardParam:any):string {
        var regexObject, isFirstUrlParam = true;
        for (var param in wildcardParam) {
            if (wildcardParam.hasOwnProperty(param) && path.indexOf("{" + param + "}") >= 0) {
                regexObject = new RegExp("{" + param + "}", "g");
                path = path.replace(regexObject, HttpEndpoints.convertParamsToStringObject(wildcardParam[param]));
            } else {
                if (isFirstUrlParam) {
                    path += "?";
                    isFirstUrlParam = false;
                }
                // Check if end of url contains &.
                path += (path.substr(path.length - 1) == "&" || path.substr(path.length - 1) == "?") ?
                param + "=" + HttpEndpoints.convertParamsToStringObject(wildcardParam[param]) :
                "&" + param + "=" + HttpEndpoints.convertParamsToStringObject(wildcardParam[param]);
            }
        }
        return path;
    }

    /**
     * Method to convert JSON parameter Object into string.
     *
     * @param param
     * @returns {string}
     */
    private static convertParamsToStringObject(param?:any):any {
        return Array.isArray(param) ? JSON.stringify(param) : param;
    }
}