import util = require("util");
import request = require("request");
import {promise} from "protractor";
import Promise = promise.Promise;

/** 
 * Wraps a Promise, providing some handy properties to access status code and body
*/  
export class ResponsePromise {
    private wrappedPromise: Promise<request.Response>;
    
    constructor(promise: Promise<request.Response>) {
        this.wrappedPromise = promise;
    }

    get statusCode(): Promise<number> {
        return this.wrappedPromise.then(result => result.statusCode);
    }

    header(name:string):Promise<string | string[] | undefined> {
        return this.headers.then(headers => headers[name.toLowerCase()]);
    }

    get headers():Promise<any> {
        return this.wrappedPromise.then(result => result.headers);
    }

    get body(): Promise<Buffer> {
        return this.wrappedPromise.then(result => result.body);
    }

    get stringBody(): Promise<string> {
        return this.wrappedPromise.then(result => result.body.toString());
    }

    get jsonBody(): JsonPromise {
        return new JsonPromise(this.wrappedPromise.then(result => asJson(result.body)));
    }

    then(onFulfilled: promise.IFulfilledCallback<any>, onRejected?: promise.IRejectedCallback): Promise<any> {
        return this.wrappedPromise.then(onFulfilled, onRejected);
    }

    catch(callback: promise.IFulfilledCallback<any>): Promise<any> {
        return this.wrappedPromise.catch(callback);
    }
}

export class JsonPromise {
    private wrappedPromise: Promise<any>;
    
    constructor(promise: Promise<any>) {
        this.wrappedPromise = promise;
    }

    get(prop: string | number): JsonPromise {
        return new JsonPromise(this.wrappedPromise.then(obj => obj[prop]));
    }

    /**
     *
     * utility method to fetch value from nested json object.
     *
     * Example:
     *
     *  let obj = {
     *      user : {
     *          "name" : "sudharsan",
     *         "email" : "sudharsanselvaraj.c@gmail.com"
     *      }
     *  };
     *
     * let prop = "user.name"
     *
     *  OUTPUT: "sudharsan"
     *
     * @param prop
     * @returns {JsonPromise}
     */
    deepGet(prop:string):JsonPromise {
        return new JsonPromise(this.wrappedPromise.then((obj) => {
            return prop.split(".").reduce((accumulator,currProp)=> {
                return accumulator[currProp];
            }, obj);
        }));
    }

    /**
     * utility method to get array of values corresponding to a specific key from response array.
     *
     * Example:
     *
     * let userList = [
     *            {
     *              name : "sudharsan",
     *              email : "sudharsanselvaraj.c@gmail.com"
     *            },
     *            {
     *              name : "protracctor",
     *              email : "protractor@gmail.com"
     *            }
     *  ];
     *
     * let key = "name";
     *
     *  OUTPUT: ["sudharsan","protractor"]
     *
     * @param key
     * @returns {JsonPromise}
     */

    pluckFromArrayOfObject(key:string):JsonPromise {
        return new JsonPromise(this.wrappedPromise.then((arr:any) => arr.map((a:any):any => a[key])));
    }

    /**
     * utility method to sort any array from response body.
     */
    getSortedArray():JsonPromise {
        return new JsonPromise(this.wrappedPromise.then((arr:any[]):any[] => arr.sort()));
    }

    /**
     * utility method to get length of an array from response body.
     */
    getArrayCount():JsonPromise {
        return new JsonPromise(this.wrappedPromise.then((arr:any[]):number => arr.length));
    }

    /**
     * utility method to filter an array from response body.
     */
    filterArray(callback:(val:any,index?:number,_arr?:any[],args?:any) => boolean ):JsonPromise {
        return new JsonPromise(this.wrappedPromise.then((arr:any):any[] => arr.filter(callback)));
    }
    
    then(onFulfilled: promise.IFulfilledCallback<any>, onRejected?: promise.IRejectedCallback): Promise<any> {
        return this.wrappedPromise.then(onFulfilled, onRejected);
    }

    catch(callback: promise.IFulfilledCallback<any>): Promise<any> {
        return this.wrappedPromise.catch(callback);
    }
}

function asJson(body: any): any {
    if (util.isString(body) || Buffer.isBuffer(body)) {
        return JSON.parse(body.toString());
    } else {
        return body;
    }
}