import * as enums from "../enums";

export interface Response {
    isSuccess: boolean;
    statusCode: enums.StatusCode;
    errorMessage?: string;
    stack?: string;
    documentUrl?: string;
    actualErrorMessage?: string;
}
