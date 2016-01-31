import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

/**
 * create a code, store it in cache, create an image, return an base64 url of it.
 */
export async function create(id: string): Promise<{ url: string; code: string; }> {
    await services.frequency.limitCaptcha(id);

    // 60466176 == 36 ** 5, the code will be a string of 6 characters. the character is number or upper case letter.
    const code = Math.round((Math.random() * 35 + 1) * 60466176).toString(36).toUpperCase();

    services.cache.set(settings.cacheKeys.userCaptcha + id, code, 60);

    const width = 140;
    const height = 45;

    const canvas = new libs.Canvas(width, 50);
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.fillStyle = "#F0F0F0";
    context.fillRect(0, 0, width, 50);
    context.fillStyle = "#000";
    context.font = "30px Georgia";
    context.fillText(code, 10, height - 10);

    return {
        url: canvas.toDataURL(),
        code: code,
    };
}

/**
 * validate the code matched the one from the cache.
 */
export async function validate(id: string, code: string): Promise<void> {
    const key = settings.cacheKeys.userCaptcha + id;
    const targetCode = await services.cache.getAsync(key);

    await services.cache.deleteKeyAsync(key);

    if (code.toUpperCase() !== targetCode) {
        throw services.error.fromMessage("the code is invalid or expired now.", types.StatusCode.invalidRequest);
    }
}
