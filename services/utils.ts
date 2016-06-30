import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export function assert(value: any, message: any, extra?: string) {
    if (typeof message !== "string") {
        message = JSON.stringify(message);
    }
    if (!value) {
        if (extra) {
            throw libs.util.format(message, extra);
        }
        throw message;
    }
}

export const renameAsync = (oldPath: string, newPath: string) => {
    return new Promise((resolve, reject) => {
        libs.fs.rename(oldPath, newPath, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

export function generateUuid() {
    return libs.uuid.v4().replace(/-/g, "");
}

export function green(message: string) {
    console.log(libs.colors.green(message));
}

export function red(message: string) {
    console.log(libs.colors.red(message));
}

export function randomInteger(min: number, range: number) {
    return Math.floor(Math.random() * range) + min;
}
