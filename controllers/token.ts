import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");
import services = require("../services/services");

export const createDocument = {
    name: "create a token for a given email",
    url: "/api/token",
    description: "will send a link with it to the given email",
    method: "POST",
    expirationDate: "no",
    contentType: "application/json",
    parameters: {
        v: {
            type: "number",
            description: "no v means the newest version"
        }
    },
    versions: {
        1: {
            expirationDate: "no",
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
                    type: "number"
                },
                errorMessage: {
                    type: "string"
                }
            }
        }
    }
};

export function create(request:libs.Request, response:libs.Response) {

}