import * as base from "./base";
import * as interfaces from "../../common/interfaces";

declare let Vue;

interface Organization {
    id: number;
    name: string;
}

interface OrganizationsResponse extends interfaces.Response {
    organizations: Organization[]
}

interface Theme {
    id: number;
    title: string;
    detail: string;
    organizationId: number;
    createTime: number;
    creator: {
        id: number,
        name: string,
        email: string
    };
    owners: {
        id: number,
        name: string,
        email: string
    }[];
    watchers: {
        id: number,
        name: string,
        email: string
    }[];

    createTimeText: string;
    isWatching: boolean;
}

interface ThemesResponse extends interfaces.Response {
    themes: Theme[];
}

interface VueBodyModel {
    organizationsCurrentUserIn: Organization[];
    currentOrganizationId: number;
    themes: Theme[];
    newThemeTitle: string;
    newThemeDetail: string;
    currentUserId: number;

    getOrganizationsCurrentUserIn: () => void;
    fetchThemes: (number) => void;
    clickOrganization: (any) => void;
    createTheme: () => void;
    setThemeCreateTimeText: () => void;
    watch: (any) => void;
    unwatch: (any) => void;
}

let vueBody: VueBodyModel = new Vue({
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
            let self: VueBodyModel = this;

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
        fetchThemes: function(organizationId: number) {
            let self: VueBodyModel = this;

            $.ajax({
                url: "/api/organizations/" + organizationId + "/themes",
                data: {},
                cache: false,
                success: (data: ThemesResponse) => {
                    if (data.isSuccess) {
                        for (let theme of data.themes) {
                            theme.isWatching = theme.watchers.some(w=> w.id === self.currentUserId);
                            theme.createTimeText = moment(theme.createTime).fromNow();
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
            let self: VueBodyModel = this;

            let organizationId = item.$data.id;

            if (self.currentOrganizationId !== organizationId) {
                self.fetchThemes(organizationId);
            }

            self.currentOrganizationId = item.$data.id;
        },
        createTheme: function() {
            let self: VueBodyModel = this;

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
            let self: VueBodyModel = this;

            for (let theme of self.themes) {
                theme.createTimeText = moment(theme.createTime).fromNow();
            }
        },
        watch: function(item) {
            let self: VueBodyModel = this;
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
            let self: VueBodyModel = this;
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
});

$(document).ready(function() {
    base.vueHead.authenticate((error, data) => {
        vueBody.currentUserId = data.id;

        vueBody.getOrganizationsCurrentUserIn();

        setInterval(vueBody.setThemeCreateTimeText, 10000);
    });
});