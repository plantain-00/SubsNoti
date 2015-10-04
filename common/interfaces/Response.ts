import * as enums from "../enums";
import * as interfaces from "../interfaces";

export interface Response {
    isSuccess: boolean;
    statusCode: enums.StatusCode;
    errorCode: enums.ErrorCode;
    errorMessage: string;
    documentUrl: string;
}