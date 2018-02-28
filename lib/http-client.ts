import * as http from 'http';
import * as util from 'util';
import request = require('request');
import {protractor, promise} from 'protractor';
import {ResponsePromise} from "./promisewrappers";
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

    request(options: request.Options): ResponsePromise {
        const deferred: Deferred<request.Response> = promise.defer<request.Response>();
        const failOnError = this._failOnHttpError;
        const callback: request.RequestCallback = (error: any, response: request.Response, body: any) => {
            if (error) {
                deferred.reject(error);
            } else if (failOnError && !(response.statusCode >= 200 && response.statusCode < 300)) {
                body = body || "";
                if (body.toString() === '[object Object]') {
                    body = JSON.stringify(body);
                } else if (Buffer.isBuffer(body)) {
                    if (body.indexOf(0) >= 0) {
                        body = "<" + response.headers["content-type"] + ", length=" + body.length + ">";
                    } else {
                        body = body.toString();
                    }
                }
                deferred.reject("request returned status code of " + response.statusCode + " and body " + body);
            } else {
                deferred.fulfill(response);
            }
        }
        return new ResponsePromise(controlFlow.execute(() => {
            request(options, callback);
            return deferred.promise;
        }));
    }

    get(url:string, headers?: any): ResponsePromise {
        return this.send('GET', url, null, headers);
    }
    
    post(url:string, body?: any, headers?: any): ResponsePromise {
        return this.send('POST', url, body, headers);
    }
    
    put(url:string, body?: any, headers?: any): ResponsePromise {
        return this.send('PUT', url, body, headers);
    }
    
    delete(url:string, headers?: any): ResponsePromise {
        return this.send('DELETE', url, null, headers);
    }

    private send(method: string, url: string, body?: any, headers?: object): ResponsePromise {
        const options: request.Options = {
            baseUrl: this.baseUrl,
            url: url,
            method: method,
            headers: headers,
            jar: true,
            encoding: null
        }
        if (util.isString(body)) {
            options.body = body;
        } else if (util.isObject(body)) {
            options.json = body;
        }
        return this.request(options);
    }
}
