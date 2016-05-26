import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

/**
 * if exists, do nothing, otherwise create one and save it.
 */
export async function createIfNotExistsAsync(id: string): Promise<void> {
    const seed: string = libs.md5(id);
    const fileName = getDefaultName(id);
    const existResponse = await services.request.getAsync(`${settings.imageServer}/${fileName}`, types.responseType.others);
    if (existResponse.response.statusCode === 200) {
        services.logger.logInfo("exists:" + fileName);
    } else {
        services.logger.logInfo("statusCode:" + existResponse.response.statusCode);
        services.logger.logInfo("creating:" + fileName);
        const creationResponse = await createAsync(seed, fileName);
        services.logger.logInfo(JSON.stringify(creationResponse.body));
    }
}

function createAsync(seed: string, fileName: string) {
    const red = seed.substr(0, 2);
    const blue = seed.substr(2, 2);
    const green = seed.substr(4, 2);
    const color = "#" + red + blue + green;

    let points = parseInt(seed.substr(6, 4), 16);

    const canvas = new libs.Canvas(420, 420);
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
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

export function getDefaultName(id: string): string {
    return settings.imagePaths.avatar + id + ".png";
}
