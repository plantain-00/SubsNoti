import * as base from "./base";
import * as interfaces from "../../interfaces/interfaces";

interface GetOrganizationsResponse extends interfaces.GetOrganizationsResponse, interfaces.Response { }

interface GetThemesResponse extends interfaces.GetThemesResponse, interfaces.Response { }

let vueBody;
let vueBodyModel = {
    el: "#vue-body",
    data: {
        organizationsCurrentUserIn: [],
        currentOrganizationId: 0,
        themes: [],
        newThemeTitle: "",
        newThemeDetail: ""
    },
    methods: {
        getOrganizationsCurrentUserIn: function() {
            let self = this;

            $.ajax({
                url: "/api/user/joined/organizations",
                data: {},
                cache: false,
                success: (data: GetOrganizationsResponse) => {
                    if (data.isSuccess) {
                        self.organizationsCurrentUserIn = data.organizations;
                        if (data.organizations.length > 0) {
                            self.currentOrganizationId = data.organizations[0].id;

                            self.fetchThemes(data.organizations[0].id);
                        }
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        },
        fetchThemes: function(organizationId) {
            let self = this;

            $.ajax({
                url: "/api/organizations/" + organizationId + "/themes",
                data: {},
                cache: false,
                success: (data: GetThemesResponse) => {
                    if (data.isSuccess) {
                        self.themes = data.themes;

                        for (let theme of self.themes) {
                            theme.$add("createTimeText", moment(theme.createTime).fromNow());
                        }
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        },
        clickOrganization: function(item) {
            if (this.currentOrganizationId !== item.$data.id) {
                this.fetchThemes(item.$data.id);
            }

            this.currentOrganizationId = item.$data.id;
        },
        createTheme: function() {
            let self = this;

            $.post("/api/user/themes", {
                themeTitle: self.newThemeTitle,
                themeDetail: self.newThemeDetail,
                organizationId: self.currentOrganizationId
            }, (data: interfaces.Response) => {
                if (data.isSuccess) {
                    self.fetchThemes(self.currentOrganizationId);
                    alert("success");
                }
                else {
                    alert(data.errorMessage);
                }
            });
        },
        setThemeCreateTimeText: function() {
            for (let theme of this.themes) {
                theme.createTimeText = moment(theme.createTime).fromNow();
            }
        }
    }
};

$(document).ready(function() {
    vueBody = new Vue(vueBodyModel);

    base.authenticate((error, data) => {
        vueBody.getOrganizationsCurrentUserIn();

        setInterval(vueBody.setThemeCreateTimeText, 10000);
    });
});