import http = require('http');
import util = require('util');
import request = require('request');
import protractor = require('protractor');
import {ResponsePromise} from "./promisewrappers";
import Deferred = protractor.promise.Deferred;
import Promise = protractor.promise.Promise;

const controlFlow:protractor.promise.ControlFlow = protractor.promise.controlFlow();

interface AuthOptions {
    user?:string;
    username?:string;
    pass?:string;
    password?:string;
    sendImmediately?:boolean;
    authToken?:string
}

enum AUTH_TYPES {
    NO_AUTH = 0,
    BASIC_AUTH = 1,
    TOKEN_AUTH = 2,
}

export class HttpClient {
    private baseUrl:string;
    private _failOnHttpError:boolean = false;
    private authenticationMechanism:AUTH_TYPES = AUTH_TYPES.NO_AUTH;
    private authObject:AuthOptions = {};

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || "";
    }

    set failOnHttpError(value: boolean) {
        this._failOnHttpError = value;
    }

    static set commonRequestOptions(commonOptions: request.CoreOptions) {
        request.defaults(commonOptions);
    }

    withBasicAuth(userName:string, password:string) {
        this.authenticationMechanism = AUTH_TYPES.BASIC_AUTH;
        this.resetAuthOptions();
        this.authObject.username = userName;
        this.authObject.password = password;
    }

    withBearerToken(token:string) {
        this.authenticationMechanism = AUTH_TYPES.TOKEN_AUTH;
        this.resetAuthOptions();
        this.authObject.authToken = token;
    }

    withNoAuth() {
        this.authenticationMechanism = AUTH_TYPES.NO_AUTH;
        this.resetAuthOptions();
    }

    private resetAuthOptions() {
        this.authObject.username = "";
        this.authObject.password = "";
        this.authObject.authToken = "";
    }

    request(options: request.Options): ResponsePromise {
        const deferred: Deferred<request.Response> = protractor.promise.defer<request.Response>();
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

    patch(url:string, body?: any, headers?: any): ResponsePromise {
        return this.send('PATCH', url, body, headers);
    }

    put(url:string, body?: any, headers?: any): ResponsePromise {
        return this.send('PUT', url, body, headers);
    }
    
    delete(url:string, headers?: any): ResponsePromise {
        return this.send('DELETE', url, null, headers);
    }

    public send(method: string, url: string, body?: any, headers?: object): ResponsePromise {
        const options: request.Options = {
            baseUrl: this.baseUrl,
            url: url,
            method: method,
            headers: headers,
            jar: true,
            encoding: null
        };

        if (util.isString(body)) {
            options.body = body;
        } else if (util.isObject(body)) {
            options.json = body;
        }
        
        //if any authentication mechanism is provided, then append respective auth object to headers.
        
        if (this.authenticationMechanism == AUTH_TYPES.BASIC_AUTH) {
            options.auth = this.authObject;
        } else if(this.authenticationMechanism == AUTH_TYPES.TOKEN_AUTH) {
            options.auth = {
                bearer : this.authObject.authToken
            };

        }

        return this.request(options);
    }

}
