"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

/**
 * if exists, do nothing, otherwise create one and save it.
 */
export async function createIfNotExistsAsync(id: string): Promise<void> {
    let seed: string = libs.md5(id);
    let fileName = getDefaultName(id);
    let existResponse = await services.request.getAsync(`${settings.imageServer.get(settings.currentEnvironment)}/${fileName}`, types.responseType.others);
    if (existResponse.response.statusCode === types.StatusCode.OK) {
        console.log("exists:" + fileName);
    } else {
        console.log("statusCode:" + existResponse.response.statusCode);
        console.log("creating:" + fileName);
        let creationResponse = await createAsync(seed, fileName);
        console.log(creationResponse.body);
    }
    return Promise.resolve();
}

function createAsync(seed: string, fileName: string) {
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

    return new Promise<any>((resolve, reject) => {
        canvas.toBuffer(function(error, buf) {
            if (error) {
                reject(error);
            } else {
                resolve(buf);
            }


        });
    }).then(buf => {
        let formData = {};
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

export function getDefaultName(id: string): string {
    return settings.imagePaths.avatar + id + ".png";
}
