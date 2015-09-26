declare let $;
declare let Vue;

import * as base from "./base";
import * as interfaces from "../../interfaces/interfaces";

interface GetOrganizationsResponse extends interfaces.GetOrganizationsResponse, interfaces.Response {

}

let vueBody;
const vueBodyModel = {
    el: "#vue-body",
    data: {
        organizationsCurrentUserIn: [],
        currentOrganizationId: 0
    },
    methods: {
        getOrganizationsCurrentUserIn: function() {
            const self = this;

            $.ajax({
                url: "/api/user/joined/organizations",
                data: {
                },
                cache: false,
                success: function(data: GetOrganizationsResponse) {
                    self.organizationsCurrentUserIn = data.organizations;
                    if (data.organizations.length > 0) {
                        self.currentOrganizationId = data.organizations[0].id;
                    }
                }
            });
        },
        clickOrganization: function(item) {
            this.currentOrganizationId = item.$data.id;
        }
    }
};

$(document).ready(function() {
    vueBody = new Vue(vueBodyModel);

    base.authenticate((error, data) => {
        vueBody.getOrganizationsCurrentUserIn();
    });
});