"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../share/types");
const libs = require("../libs");
const settings = require("../settings");
const services = require("../services");
/**
 * if exists, do nothing, otherwise create one and save it.
 */
function createIfNotExistsAsync(id) {
    return __awaiter(this, void 0, Promise, function* () {
        const seed = libs.md5(id);
        const fileName = getDefaultName(id);
        const existResponse = yield services.request.getAsync(`${settings.imageServer}/${fileName}`, types.responseType.others);
        if (existResponse.response.statusCode === 200 /* OK */) {
            services.logger.logInfo("exists:" + fileName);
        }
        else {
            services.logger.logInfo("statusCode:" + existResponse.response.statusCode);
            services.logger.logInfo("creating:" + fileName);
            const creationResponse = yield createAsync(seed, fileName);
            services.logger.logInfo(JSON.stringify(creationResponse.body));
        }
    });
}
exports.createIfNotExistsAsync = createIfNotExistsAsync;
function createAsync(seed, fileName) {
    const red = seed.substr(0, 2);
    const blue = seed.substr(2, 2);
    const green = seed.substr(4, 2);
    const color = "#" + red + blue + green;
    let points = parseInt(seed.substr(6, 4), 16);
    const canvas = new libs.Canvas(420, 420);
    const context = canvas.getContext("2d");
    context.fillStyle = "#F0F0F0";
    context.fillRect(0, 0, 420, 420);
    context.fillStyle = color;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
            if ((points & 1) === 1) {
                context.fillRect(35 + i * 70, 35 + j * 70, 70, 70);
                context.fillRect(315 - i * 70, 35 + j * 70, 70, 70);
            }
            points = points >> 1;
        }
    }
    return new Promise((resolve, reject) => {
        canvas.toBuffer(function (error, buf) {
            if (error) {
                reject(error);
            }
            else {
                resolve(buf);
            }
        });
    }).then(buf => {
        const formData = {};
        formData[fileName] = {
            value: buf,
            options: {
                filename: fileName,
                contentType: "image/png",
            },
        };
        return services.request.postMultipartAsync(`${settings.imageUploader}/api/persistent`, formData);
    });
}
function getDefaultName(id) {
    return settings.imagePaths.avatar + id + ".png";
}
exports.getDefaultName = getDefaultName;
