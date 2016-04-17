"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../share/types");
const services = require("../services");
exports.publicOrganizationName = "public";
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const organization = yield services.mongo.Organization.findOne({ name: exports.publicOrganizationName })
            .select("_id")
            .exec();
        if (organization) {
            exports.publicOrganizationId = organization._id;
        }
        else {
            const newOrganization = yield services.mongo.Organization.create({
                name: exports.publicOrganizationName,
                status: 0 /* normal */,
                themes: [],
            });
            exports.publicOrganizationId = newOrganization._id;
        }
    });
}
exports.init = init;
