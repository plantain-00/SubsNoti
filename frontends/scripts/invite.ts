import * as base from "./base";
import * as interfaces from "../../common/interfaces";

declare let Vue;

interface Organization {
    id: string;
    name: string;
}

interface OrganizationsResponse extends interfaces.Response {
    organizations: Organization[]
}

interface VueBodyModel {
    email: string;
    organizationsCurrentUserCreated: Organization[];
    currentOrganizationId: string;

    canInvite: boolean;

    getOrganizationsCurrentUserCreated: () => void;
    invite: () => void;
}

let vueBody: VueBodyModel = new Vue({
    el: "#vue-body",
    data: {
        email: "",
        organizationsCurrentUserCreated: [],
        currentOrganizationId: ""
    },
    computed: {
        canInvite: function(): boolean {
            let self: VueBodyModel = this;

            return base.isEmail(self.email.trim()) && base.vueHead.requestCount === 0;
        }
    },
    methods: {
        getOrganizationsCurrentUserCreated: function() {
            let self: VueBodyModel = this;

            $.ajax({
                url: "/api/user/created/organizations",
                data: {},
                cache: false,
                success: (data: OrganizationsResponse) => {
                    if (data.isSuccess) {
                        self.organizationsCurrentUserCreated = data.organizations;
                        if (data.organizations.length > 0) {
                            let lastOrganizationId = window.localStorage.getItem(base.localStorageNames.lastOrganizationId);
                            if (lastOrganizationId && ~_.findIndex(data.organizations, o=> o.id === lastOrganizationId)) {
                                self.currentOrganizationId = lastOrganizationId;
                            }
                            else {
                                self.currentOrganizationId = data.organizations[0].id;
                            }
                        }
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        },
        invite: function() {
            let self: VueBodyModel = this;

            $.post("/api/organizations/" + self.currentOrganizationId + "/users/" + self.email + "/joined", {}, function(data: interfaces.Response) {
                if (data.isSuccess) {
                    alert("success.");
                } else {
                    alert(data.errorMessage);
                }
            });
        },
        clickOrganization: function(organization: Organization) {
            let self: VueBodyModel = this;

            self.currentOrganizationId = organization.id;

            window.localStorage.setItem(base.localStorageNames.lastOrganizationId, organization.id);
        }
    }
});

$(document).ready(function() {
    base.vueHead.authenticate((error, data) => {
        if (error) {
            console.log(error);
        }

        vueBody.getOrganizationsCurrentUserCreated();
    });
});
