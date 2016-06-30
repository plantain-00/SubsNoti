import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export function parse(xml: string) {
    return new Promise<any>((resolve, reject) => {
        new libs.xml2js.Parser({
            trim: true,
            explicitArray: false,
            explicitRoot: false,
        }).parseString(xml, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

export function build(obj: {}) {
    return new libs.xml2js.Builder().buildObject(obj);
}
