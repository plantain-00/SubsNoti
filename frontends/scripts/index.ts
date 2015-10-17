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

interface User {
    id: string;
    name: string;
    email: string;
}

interface Theme {
    id: string;
    title: string;
    detail: string;
    organizationId: string;
    createTime: number;
    creator: User;
    owners: User[];
    watchers: User[];

    createTimeText: string;
    isWatching: boolean;
}

interface ThemesResponse extends interfaces.Response {
    themes: Theme[];
}

interface VueBodyModel {
    organizationsCurrentUserIn: Organization[];
    currentOrganizationId: string;
    themes: Theme[];
    newThemeTitle: string;
    newThemeDetail: string;

    getOrganizationsCurrentUserIn: () => void;
    fetchThemes: (string) => void;
    clickOrganization: (Organization) => void;
    createTheme: () => void;
    setThemeCreateTimeText: () => void;
    watch: (Theme) => void;
    unwatch: (Theme) => void;
}

let vueBody: VueBodyModel = new Vue({
    el: "#vue-body",
    data: {
        organizationsCurrentUserIn: [],
        currentOrganizationId: "",
        themes: [],
        newThemeTitle: "",
        newThemeDetail: "",
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
                            let lastOrganizationId = window.localStorage.getItem(base.localStorageNames.lastOrganizationId);
                            if (lastOrganizationId && ~_.findIndex(data.organizations, o=> o.id === lastOrganizationId)) {
                                self.currentOrganizationId = lastOrganizationId;
                            }
                            else {
                                self.currentOrganizationId = data.organizations[0].id;
                            }

                            self.fetchThemes(data.organizations[0].id);
                        }
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        },
        fetchThemes: function(organizationId: string) {
            let self: VueBodyModel = this;

            $.ajax({
                url: "/api/organizations/" + organizationId + "/themes",
                data: {},
                cache: false,
                success: (data: ThemesResponse) => {
                    if (data.isSuccess) {
                        for (let theme of data.themes) {
                            theme.isWatching = theme.watchers.some(w=> w.id === base.vueHead.currentUserId);
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
        clickOrganization: function(organization: Organization) {
            let self: VueBodyModel = this;

            if (self.currentOrganizationId !== organization.id) {
                self.fetchThemes(organization.id);
            }

            self.currentOrganizationId = organization.id;

            window.localStorage.setItem(base.localStorageNames.lastOrganizationId, organization.id);
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
        watch: function(theme: Theme) {
            let self: VueBodyModel = this;

            $.post("/api/user/themes/" + theme.id + "/watched", {}, (data: interfaces.Response) => {
                if (data.isSuccess) {
                    self.fetchThemes(self.currentOrganizationId);
                    alert("success");
                }
                else {
                    alert(data.errorMessage);
                }
            });
        },
        unwatch: function(theme: Theme) {
            let self: VueBodyModel = this;

            $.ajax({
                url: "/api/user/themes/" + theme.id + "/watched",
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
        if (error) {
            console.log(error);
            return;
        }

        vueBody.getOrganizationsCurrentUserIn();
        setInterval(vueBody.setThemeCreateTimeText, 10000);
    });
});
