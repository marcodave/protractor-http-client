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

    header(name: string): Promise<string | string[] | undefined> {
        return this.wrappedPromise.then(result => result.headers[name.toLowerCase()]);
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