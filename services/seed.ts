import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export let publicOrganizationId: libs.mongoose.Types.ObjectId;
export const publicOrganizationName = "public";

export async function init() {
    const organization = await services.mongo.Organization.findOne({ name: publicOrganizationName })
        .select("_id")
        .exec();
    if (organization) {
        publicOrganizationId = organization._id;
    } else {
        const newOrganization = await services.mongo.Organization.create({
            name: publicOrganizationName,
            status: types.OrganizationStatus.normal,

            themes: [],
        });

        publicOrganizationId = newOrganization._id;
    }
}
