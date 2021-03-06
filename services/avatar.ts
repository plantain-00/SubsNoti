import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

/**
 * if exists, do nothing, otherwise create one and save it.
 */
export async function createIfNotExistsAsync(id: string): Promise<void> {
    const seed: string = libs.md5(id);
    const fileName = getDefaultName(id);
    const [existResponse] = await services.request.request<string>({
        method: types.httpMethod.get,
        url: `${services.settings.imageServer}/${fileName}`,
    }, types.responseType.others);
    if (existResponse.statusCode === 200) {
        services.logger.logInfo("exists:" + fileName);
    } else {
        services.logger.logInfo("statusCode:" + existResponse.statusCode);
        services.logger.logInfo("creating:" + fileName);
        const [, json] = await createAsync(seed, fileName);
        services.logger.logInfo(json);
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

    return new Promise<Buffer>((resolve, reject) => {
        canvas.toBuffer((error: Error, buffer: Buffer) => {
            if (error) {
                reject(error);
            } else {
                resolve(buffer);
            }

        });
    }).then(buffer => {
        const formData: any = {};
        formData[fileName] = {
            value: buffer,
            options: {
                filename: fileName,
                contentType: "image/png",
            },
        };

        return services.request.request({
            url: `${services.settings.imageUploader}/api/persistent`,
            method: types.httpMethod.post,
            formData,
            headers: {},
        });
    });
}

export function getDefaultName(id: string): string {
    return services.settings.imagePaths.avatar + id + ".png";
}
