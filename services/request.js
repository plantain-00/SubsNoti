"use strict";
const types = require("../share/types");
const libs = require("../libs");
const settings = require("../settings");
function post(options) {
    return new Promise((resolve, reject) => {
        libs.request.post(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            else {
                resolve({
                    response: response,
                    body: JSON.parse(body),
                });
            }
        });
    });
}
exports.post = post;
function postAsync(url, form) {
    const options = {
        url: url,
        form: form,
        headers: {},
    };
    options.headers[settings.headerNames.version] = settings.version;
    return post(options);
}
exports.postAsync = postAsync;
function postMultipartAsync(url, formData) {
    const options = {
        url: url,
        formData: formData,
        headers: {},
    };
    options.headers[settings.headerNames.version] = settings.version;
    return post(options);
}
exports.postMultipartAsync = postMultipartAsync;
function get(options, type) {
    if (!type) {
        type = types.responseType.json;
    }
    return new Promise((resolve, reject) => {
        libs.request(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            else {
                resolve({
                    response: response,
                    body: type === types.responseType.json ? JSON.parse(body) : body,
                });
            }
        });
    });
}
exports.get = get;
function getAsync(url, type) {
    return get({
        url: url,
    }, type);
}
exports.getAsync = getAsync;
function request(options, type) {
    if (!type) {
        type = types.responseType.json;
    }
    return new Promise((resolve, reject) => {
        libs.request(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            else {
                resolve([response, type === types.responseType.json ? JSON.parse(body) : body]);
            }
        });
    });
}
exports.request = request;
