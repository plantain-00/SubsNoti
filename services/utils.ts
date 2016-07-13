import * as libs from "../libs";

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

export function red(message: Error | string) {
    console.log(libs.colors.red(message));
}

export function randomInteger(min: number, range: number) {
    return Math.floor(Math.random() * range) + min;
}

export function randomPop<T>(array: T[], count: number): { pick: T[]; remain: T[] } {
    if (count <= 0) {
        return { pick: [], remain: array };
    }
    if (count >= array.length) {
        return { pick: array, remain: [] };
    }
    if (count <= array.length / 2) {
        const pick: T[] = [];
        for (let i = 0; i < count; i++) {
            const index = randomInteger(0, array.length);
            pick.push(array.splice(index, 1)[0]);
        }
        return { pick, remain: array };
    } else {
        const remainCount = array.length - count;
        const remain: T[] = [];
        for (let i = 0; i < remainCount; i++) {
            const index = randomInteger(0, array.length);
            remain.push(array.splice(index, 1)[0]);
        }
        return { pick: array, remain };
    }
}
