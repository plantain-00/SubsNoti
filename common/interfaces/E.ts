import * as enums from "../enums";

export interface E extends Error {
    statusCode: enums.StatusCode;
}
