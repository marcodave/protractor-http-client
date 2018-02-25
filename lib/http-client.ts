import * as http from 'http';
import * as util from 'util';
import request = require('request');
import {protractor, promise} from 'protractor';
import Deferred = promise.Deferred;
import Promise = promise.Promise;

const controlFlow: promise.ControlFlow = protractor.promise.controlFlow();

export class HttpClient {
    private baseUrl?: string;
    private _failOnHttpError: boolean = false;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl;
    }

    set failOnHttpError(value: boolean) {
        this._failOnHttpError = value;
    }

    static set commonRequestOptions(commonOptions: request.CoreOptions) {
        request.defaults(commonOptions);
    }

    executeWithOptions(options: request.Options): ResponsePromise {
        const deferred: Deferred<any> = promise.defer<any>();
        const failOnError = this._failOnHttpError;
        const callback: request.RequestCallback = (error: any, response: request.Response, body: any) => {
            if (error) {
                deferred.reject(error);
            } else if (failOnError && !(response.statusCode >= 200 && response.statusCode < 300)) {
                deferred.reject("request returned " + response.statusCode);
            } else {
                deferred.fulfill(response);
            }
        }
        return new ResponsePromise(controlFlow.execute(() => {
            request(options, callback);
            return deferred.promise;
        }));
    }

    execute(method: string, url: string, body?: any, headers?: any): ResponsePromise {
        const options: request.Options = {
            baseUrl: this.baseUrl,
            url: url,
            method: method,
            headers: headers,
            jar: true
        }
        if (util.isString(body)) {
            options.body = body;
        } else if (util.isObject(body)) {
            options.json = body;
        }
        return this.executeWithOptions(options);
    }

    get(url:string, headers?: any): ResponsePromise {
        return this.execute('GET', url, null, headers);
    }

    post(url:string, body?: any, headers?: any): ResponsePromise {
        return this.execute('POST', url, body, headers);
    }
}

/** 
 * Wraps a Promise, providing some handy properties to access status code and body
*/  
export class ResponsePromise {
    private wrappedPromise: Promise<request.Response>;
    
    constructor(promise: Promise<request.Response>) {
        this.wrappedPromise = promise;
    }

    get statusCode(): Promise<number> {
        return this.wrappedPromise.then((result) => result.statusCode);
    }

    get body(): Promise<any> {
        return this.wrappedPromise.then((result) => result.body);
    }

    get jsonBody(): Promise<any> {
        return this.wrappedPromise.then((result) => asJson(result.body));
    }

    then(onFulfilled: promise.IFulfilledCallback<any>, onRejected?: promise.IRejectedCallback): Promise<any> {
        return this.wrappedPromise.then(onFulfilled, onRejected);
    }

    catch(callback: promise.IFulfilledCallback<any>): Promise<any> {
        return this.wrappedPromise.catch(callback);
    }
}

function asJson(body: any) {
    if (util.isString(body)) {

    }
}