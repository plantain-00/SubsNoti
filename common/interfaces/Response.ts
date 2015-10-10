import * as enums from "../enums";

export interface Response {
    isSuccess: boolean;
    statusCode: enums.StatusCode;
    errorCode: enums.ErrorCode;
    errorMessage: string;
    documentUrl: string;
}
