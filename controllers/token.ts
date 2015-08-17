import libs = require("../libs");
import settings = require("../settings");
import services = require("../services/services");

export const createDocument = {
    name: "create a token for a given email",
    url: "/token",
    description: "will send it to the given email",
    method: "POST",
    contentType: "application/json",
    requestBody: {
        emailHead: {
            type: "string",
            required: true
        },
        emailTail: {
            type: "string",
            required: true
        }
    },
    responseBody: {
        isSuccess: {
            type: "boolean"
        },
        statusCode: {
            type: "number"
        },
        errorCode: {
            type: "number",
            description: "appears when isSuccess == false"
        },
        errorMessage: {
            type: "string",
            description: "appears when isSuccess == false"
        }
    }
};

export function create(request:libs.Request, response:libs.Response) {

}