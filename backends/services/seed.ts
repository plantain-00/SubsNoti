"use strict";

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export let publicOrganizationId: libs.ObjectId;
export let publicOrganizationName = "public";

export async function init() {
    let organization = await services.mongo.Organization.findOne({ name: publicOrganizationName })
        .select("_id")
        .exec();
    if (organization) {
        publicOrganizationId = organization._id;
    } else {
        organization = await services.mongo.Organization.create({
            name: publicOrganizationName,
            status: enums.OrganizationStatus.normal,

            themes: [],
        });

        publicOrganizationId = organization._id;
    }
}
