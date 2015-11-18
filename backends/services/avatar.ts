"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

function createIfNotExists(id: string, next: (error: Error) => void) {
    let seed: string = libs.md5(id);
    let fileName = getDefaultName(id);
    libs.request(`http://${settings.config.imageServer.outerHostName}:${settings.config.imageServer.port}/${fileName}`, function(error, response, body) {
        if (error) {
            console.log("error:" + error);
            next(null);
        }
        if (response.statusCode === 200) {
            console.log("exists:" + fileName);
            next(null);
        } else {
            console.log("statusCode:" + response.statusCode);
            console.log("creating:" + fileName);
            create(seed, fileName, next);
        }
    });
}

function create(seed: string, fileName: string, next: (error: Error) => void) {
    let red = seed.substr(0, 2);
    let blue = seed.substr(2, 2);
    let green = seed.substr(4, 2);
    let color = "#" + red + blue + green;

    let points = parseInt(seed.substr(6, 4), 16);

    let canvas = new libs.Canvas(420, 420);
    let context: CanvasRenderingContext2D = canvas.getContext("2d");
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

    canvas.toBuffer(function(error, buf) {
        if (error) {
            next(error);
            return;
        }

        let formData = {

        };
        formData[fileName] = {
            value: buf,
            options: {
                filename: fileName,
                contentType: "image/png",
            },
        };

        libs.request.post({
            url: `http://${settings.config.imageUploader.outerHostName}:${settings.config.imageUploader.port}/api/persistent/images?v=0.12.3`,
            formData: formData,
        }, (error, httpResponse, body) => {
            if (error) {
                next(error);
                return;
            }

            let response: types.Response = JSON.parse(body);

            if (response.isSuccess) {
                next(null);
                return;
            }

            next(new Error(response.errorMessage));
        });
    });
}

/**
 * if exists, do nothing, otherwise create one and save it.
 */
export let createIfNotExistsAsync = services.promise.promisify2<string, void>(createIfNotExists);

export function getDefaultName(id: string): string {
    return settings.config.avatar + id + ".png";
}
