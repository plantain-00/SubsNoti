import * as enums from "../enums";

export interface E extends Error {
    code: enums.ErrorCode;
}
