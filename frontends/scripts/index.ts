import * as base from "./base";
import * as enums from "../../common/enums";
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
    status: enums.ThemeStatus;
    creator: User;
    owners: User[];
    watchers: User[];

    createTimeText: string;
    isWatching: boolean;
    isHovering: boolean;
    watchersEmails: string;
    isOwner: boolean;
}

interface ThemesResponse extends interfaces.Response {
    themes: Theme[];
    totalCount: number;
}

interface VueBodyModel {
    organizationsCurrentUserIn: Organization[];
    currentOrganizationId: string;
    themes: Theme[];
    newThemeTitle: string;
    newThemeDetail: string;
    currentPage: number;
    totalCount: number;
    themeIdInEditing: string;
    titleInEditing: string;
    detailInEditing: string;

    nextThemeCount: number;
    canCreate: boolean;
    canSave: boolean;

    getOrganizationsCurrentUserIn: () => void;
    fetchThemes: (page: number) => void;
    clickOrganization: (Organization) => void;
    createTheme: () => void;
    setThemeCreateTimeText: () => void;
    watch: (Theme) => void;
    unwatch: (Theme) => void;
    close: (Theme) => void;
    reopen: (Theme) => void;
    getEmails: (users: User[]) => string;
    edit: (Theme) => void;
    cancel: (Theme) => void;
    save: (Theme) => void;
}

let vueBody: VueBodyModel = new Vue({
    el: "#vue-body",
    data: {
        organizationsCurrentUserIn: [],
        currentOrganizationId: "",
        themes: [],
        newThemeTitle: "",
        newThemeDetail: "",
        currentPage: 1,
        totalCount: 0,
        themeIdInEditing: null,
        titleInEditing: "",
        detailInEditing: ""
    },
    computed: {
        nextThemeCount: function() {
            let self: VueBodyModel = this;

            let count = self.totalCount - base.itemLimit * self.currentPage;
            return count > base.itemLimit ? base.itemLimit : count;
        },
        canCreate: function(): boolean {
            let self: VueBodyModel = this;

            return self.newThemeTitle.trim() && base.vueHead.requestCount === 0;
        },
        canSave: function(): boolean {
            let self: VueBodyModel = this;

            return self.titleInEditing.trim() && base.vueHead.requestCount === 0;
        }
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

                            self.fetchThemes(1);
                        }
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        },
        getEmails: function(users: User[]) {
            return _.reduce(users, (r, w) => r + w.email + ';', '');
        },
        fetchThemes: function(page: number) {
            let self: VueBodyModel = this;

            self.currentPage = page;

            $.ajax({
                url: "/api/organizations/" + self.currentOrganizationId + "/themes",
                data: {
                    page: page,
                    limit: base.itemLimit
                },
                cache: false,
                success: (data: ThemesResponse) => {
                    if (data.isSuccess) {
                        for (let theme of data.themes) {
                            theme.isWatching = theme.watchers.some(w=> w.id === base.vueHead.currentUserId);
                            theme.isOwner = theme.owners.some(w=> w.id === base.vueHead.currentUserId);
                            theme.createTimeText = moment(theme.createTime).fromNow();
                            theme.isHovering = false;
                            theme.watchersEmails = self.getEmails(theme.watchers);
                        }
                        if (page === 1) {
                            self.themes = data.themes;
                        }
                        else {
                            self.themes = self.themes.concat(data.themes);
                        }
                        self.totalCount = data.totalCount;
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        },
        clickOrganization: function(organization: Organization) {
            let self: VueBodyModel = this;

            self.currentOrganizationId = organization.id;
            self.fetchThemes(1);

            window.localStorage.setItem(base.localStorageNames.lastOrganizationId, organization.id);
        },
        createTheme: function() {
            let self: VueBodyModel = this;

            $.post("/api/themes", {
                themeTitle: self.newThemeTitle,
                themeDetail: self.newThemeDetail,
                organizationId: self.currentOrganizationId
            }, (data: interfaces.Response) => {
                if (data.isSuccess) {
                    self.fetchThemes(1);
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
                    theme.watchers.push({
                        id: base.vueHead.currentUserId,
                        name: base.vueHead.currentUserName,
                        email: base.vueHead.currentUserEmail
                    });
                    theme.isWatching = true;
                    theme.watchersEmails += base.vueHead.currentUserEmail + ';';
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
                        let index = _.findIndex(theme.watchers, w=> w.id === base.vueHead.currentUserId);
                        if (~index) {
                            theme.watchers.splice(index, 1);
                            theme.watchersEmails = self.getEmails(theme.watchers);
                        }
                        theme.isWatching = false;
                        alert("success");
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        },
        showMoreThemes: function() {
            let self: VueBodyModel = this;

            self.currentPage++;
            self.fetchThemes(self.currentPage);
        },
        close: function(theme: Theme) {
            $.ajax({
                url: "/api/themes/" + theme.id,
                data: {
                    status: enums.ThemeStatus.closed
                },
                cache: false,
                type: "put",
                success: (data: interfaces.Response) => {
                    if (data.isSuccess) {
                        theme.status = enums.ThemeStatus.closed;
                        alert("success");
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        },
        reopen: function(theme: Theme) {
            $.ajax({
                url: "/api/themes/" + theme.id,
                data: {
                    status: enums.ThemeStatus.open
                },
                cache: false,
                type: "put",
                success: (data: interfaces.Response) => {
                    if (data.isSuccess) {
                        theme.status = enums.ThemeStatus.open;
                        alert("success");
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        },
        edit: function(theme: Theme) {
            let self: VueBodyModel = this;

            self.themeIdInEditing = theme.id;
            self.titleInEditing = theme.title;
            self.detailInEditing = theme.detail;
        },
        cancel: function(theme: Theme) {
            let self: VueBodyModel = this;

            self.themeIdInEditing = null;
            self.titleInEditing = "";
            self.detailInEditing = "";
        },
        save: function(theme: Theme) {
            let self: VueBodyModel = this;

            $.ajax({
                url: "/api/themes/" + theme.id,
                data: {
                    title: self.titleInEditing,
                    detail: self.detailInEditing
                },
                cache: false,
                type: "put",
                success: (data: interfaces.Response) => {
                    if (data.isSuccess) {
                        theme.title = self.titleInEditing;
                        theme.detail = self.detailInEditing;
                        alert("success");

                        self.cancel(theme);
                    }
                    else {
                        alert(data.errorMessage);
                    }
                }
            });
        }
    }
});

declare let Clipboard;

$(document).ready(function() {
    let clipboard = new Clipboard('.clip');

    clipboard.on('success', function(e) {
        alert('emails copied.');
    });

    base.vueHead.authenticate((error, data) => {
        if (error) {
            console.log(error);
            return;
        }

        vueBody.getOrganizationsCurrentUserIn();
        setInterval(vueBody.setThemeCreateTimeText, 10000);
    });
});
