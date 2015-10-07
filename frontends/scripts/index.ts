import * as base from "./base";
import * as interfaces from "../../common/interfaces";

interface OrganizationsResponse extends interfaces.OrganizationsResponse, interfaces.Response { }

interface ThemesResponse extends interfaces.ThemesResponse, interfaces.Response { }

let vueBody;
let vueBodyModel = {
    el: "#vue-body",
    data: {
        organizationsCurrentUserIn: [],
        currentOrganizationId: 0,
        themes: [],
        newThemeTitle: "",
        newThemeDetail: "",
        currentUserId: 0
    },
    methods: {
        getOrganizationsCurrentUserIn: function() {
            let self = this;

            $.ajax({
                url: "/api/user/joined/organizations",
                data: {},
                cache: false,
                success: (data: OrganizationsResponse) => {
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
                success: (data: ThemesResponse) => {
                    if (data.isSuccess) {
                        for (let theme of data.themes) {
                            theme["isWatching"] = theme.watchers.some(w=> w.id === self.currentUserId);
                            theme["createTimeText"] = moment(theme.createTime).fromNow();
                        }

                        self.themes = data.themes;
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
        },
        watch: function(item) {
            let self = this;
            let themeId = item.$data.id;

            $.post("/api/user/themes/" + themeId + "/watched", {}, (data: interfaces.Response) => {
                if (data.isSuccess) {
                    self.fetchThemes(self.currentOrganizationId);
                    alert("success");
                }
                else {
                    alert(data.errorMessage);
                }
            });
        },
        unwatch: function(item) {
            let self = this;
            let themeId = item.$data.id;

            $.ajax({
                url: "/api/user/themes/" + themeId + "/watched",
                data: {},
                cache: false,
                type: "delete",
                success: (data: interfaces.Response) => {
                    if (data.isSuccess) {
                        self.fetchThemes(self.currentOrganizationId);
                        alert("success");
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        }
    }
};

$(document).ready(function() {
    vueBody = new Vue(vueBodyModel);

    base.authenticate((error, data) => {
        vueBody.$data.currentUserId = data.id;

        vueBody.getOrganizationsCurrentUserIn();

        setInterval(vueBody.setThemeCreateTimeText, 10000);
    });
});