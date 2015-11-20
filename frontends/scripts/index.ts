import * as base from "./base";
import * as types from "../../common/types";

declare let Vue;
declare let io;

interface Organization {
    id: string;
    name: string;
}

interface OrganizationsResponse extends types.Response {
    organizations: Organization[];
}

interface Theme extends types.Theme {
    createTimeText: string;
    updateTimeText?: string;
    isWatching: boolean;
    isHovering: boolean;
    watchersEmails: string;
    ownersEmails: string;
    isOwner: boolean;
}

interface ThemesResponse extends types.Response {
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
    q: string;
    isOpen: boolean;
    isClosed: boolean;
    showCreate: boolean;
    order: types.ThemeOrderType;

    nextThemeCount: number;
    canCreate: boolean;
    canShowCreate: boolean;
    canSave: boolean;
    canShowMoreThemes: boolean;

    getOrganizationsCurrentUserIn: () => void;
    fetchThemes: (page: number) => void;
    initTheme: (theme: Theme) => void;
    clickOrganization: (organization: Organization) => void;
    createTheme: () => void;
    setThemeTimeText: () => void;
    watch: (theme: Theme) => void;
    unwatch: (theme: Theme) => void;
    close: (theme: Theme) => void;
    reopen: (theme: Theme) => void;
    getEmails: (users: types.User[]) => string;
    edit: (theme: Theme) => void;
    cancel: (theme: Theme) => void;
    save: (theme: Theme) => void;
    clickOpen: () => void;
    clickClosed: () => void;
    showMoreThemes: () => void;
    clickShowCreate: () => void;
    clickOrder: (order: types.ThemeOrderType) => void;
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
        detailInEditing: "",
        q: "",
        isOpen: true,
        isClosed: false,
        showCreate: false,
        order: types.themeOrder.newest,
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
        canShowCreate: function(): boolean {
            let self: VueBodyModel = this;

            return base.vueHead.loginStatus === base.loginStatus.success;
        },
        canSave: function(): boolean {
            let self: VueBodyModel = this;

            return self.titleInEditing.trim() && base.vueHead.requestCount === 0;
        },
        canShowMoreThemes: function(): boolean {
            let self: VueBodyModel = this;

            return self.nextThemeCount > 0 && base.vueHead.requestCount === 0;
        },
    },
    methods: {
        getOrganizationsCurrentUserIn: function() {
            let self: VueBodyModel = this;

            $.ajax({
                url: "/api/user/joined",
                data: {
                    v: "0.12.0"
                },
                cache: false,
            }).then((data: OrganizationsResponse) => {
                if (data.isSuccess) {
                    self.organizationsCurrentUserIn = data.organizations;
                    if (data.organizations.length > 0) {
                        let lastOrganizationId = window.localStorage.getItem(base.localStorageNames.lastOrganizationId);
                        if (lastOrganizationId && ~_.findIndex(data.organizations, o => o.id === lastOrganizationId)) {
                            self.currentOrganizationId = lastOrganizationId;
                        } else {
                            self.currentOrganizationId = data.organizations[0].id;
                        }

                        self.fetchThemes(1);
                    }
                } else {
                    base.vueHead.showAlert(false, data.errorMessage);
                }
            });
        },
        getEmails: function(users: types.User[]) {
            return _.reduce(users, (r, w) => r + w.email + ";", "");
        },
        fetchThemes: function(page: number) {
            let self: VueBodyModel = this;

            self.currentPage = page;

            $.ajax({
                url: "/api/organizations/" + self.currentOrganizationId + "/themes",
                data: {
                    page: page,
                    limit: base.itemLimit,
                    q: self.q,
                    isOpen: self.isOpen,
                    isClosed: self.isClosed,
                    v: "0.10.2",
                    order: self.order,
                },
                cache: false,
            }).then((data: ThemesResponse) => {
                if (data.isSuccess) {
                    for (let theme of data.themes) {
                        self.initTheme(theme);
                    }
                    if (page === 1) {
                        self.themes = data.themes;
                    } else {
                        self.themes = self.themes.concat(data.themes);
                    }
                    self.totalCount = data.totalCount;
                } else {
                    base.vueHead.showAlert(false, data.errorMessage);
                }
            });
        },
        initTheme: function(theme: Theme) {
            let self: VueBodyModel = this;

            theme.isWatching = theme.watchers.some(w => w.id === base.vueHead.currentUserId);
            theme.isOwner = theme.owners.some(w => w.id === base.vueHead.currentUserId);
            theme.createTimeText = moment(<string>theme.createTime, moment.ISO_8601).fromNow();
            if (theme.updateTime) {
                theme.updateTimeText = moment(<string>theme.updateTime, moment.ISO_8601).fromNow();
            } else {
                theme.updateTimeText = theme.createTimeText;
            }
            theme.isHovering = false;
            theme.watchersEmails = self.getEmails(theme.watchers);
            theme.ownersEmails = self.getEmails(theme.owners);
            theme.creator.avatar = base.getFullUrl(theme.creator.avatar);

            for (let watcher of theme.watchers) {
                watcher.avatar = base.getFullUrl(watcher.avatar);
            }

            for (let owner of theme.owners) {
                owner.avatar = base.getFullUrl(owner.avatar);
            }
        },
        clickOrganization: function(organization: Organization) {
            let self: VueBodyModel = this;

            self.currentOrganizationId = organization.id;
            self.fetchThemes(1);

            window.localStorage.setItem(base.localStorageNames.lastOrganizationId, organization.id);
        },
        createTheme: function() {
            let self: VueBodyModel = this;

            $.post("/api/themes?v=0.0.1", {
                themeTitle: self.newThemeTitle,
                themeDetail: self.newThemeDetail,
                organizationId: self.currentOrganizationId,
            }).then((data: types.Response) => {
                if (data.isSuccess) {
                    base.vueHead.showAlert(true, "success");
                } else {
                    base.vueHead.showAlert(false, data.errorMessage);
                }
            });
        },
        setThemeTimeText: function() {
            let self: VueBodyModel = this;

            for (let theme of self.themes) {
                theme.createTimeText = moment(<string>theme.createTime, moment.ISO_8601).fromNow();
                if (theme.updateTime) {
                    theme.updateTimeText = moment(<string>theme.updateTime, moment.ISO_8601).fromNow();
                } else {
                    theme.updateTimeText = theme.createTimeText;
                }
            }
        },
        watch: function(theme: Theme) {
            let self: VueBodyModel = this;

            $.ajax({
                url: "/api/user/watched/" + theme.id + "?v=0.12.10",
                data: {},
                type: "put",
            }).then((data: types.Response) => {
                if (data.isSuccess) {
                    theme.watchers.push({
                        id: base.vueHead.currentUserId,
                        name: base.vueHead.currentUserName,
                        email: base.vueHead.currentUserEmail,
                        avatar: base.vueHead.currentAvatar,
                    });
                    theme.isWatching = true;
                    theme.watchersEmails += base.vueHead.currentUserEmail + ";";
                    theme.updateTime = moment().toISOString();
                    theme.updateTimeText = moment(theme.updateTime).fromNow();
                    base.vueHead.showAlert(true, "success");
                } else {
                    base.vueHead.showAlert(false, data.errorMessage);
                }
            });
        },
        unwatch: function(theme: Theme) {
            let self: VueBodyModel = this;

            $.ajax({
                url: "/api/user/watched/" + theme.id + "?v=0.12.10",
                data: {},
                type: "delete",
            }).then((data: types.Response) => {
                if (data.isSuccess) {
                    let index = _.findIndex(theme.watchers, w => w.id === base.vueHead.currentUserId);
                    if (~index) {
                        theme.watchers.splice(index, 1);
                        theme.watchersEmails = self.getEmails(theme.watchers);
                    }
                    theme.isWatching = false;
                    theme.updateTime = moment().toISOString();
                    theme.updateTimeText = moment(theme.updateTime).fromNow();
                    base.vueHead.showAlert(true, "success");
                } else {
                    base.vueHead.showAlert(false, data.errorMessage);
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
                url: "/api/themes/" + theme.id + "?v=0.0.1",
                data: {
                    status: types.ThemeStatus.closed
                },
                cache: false,
                type: "put",
            }).then((data: types.Response) => {
                if (data.isSuccess) {
                    base.vueHead.showAlert(true, "success");
                } else {
                    base.vueHead.showAlert(false, data.errorMessage);
                }
            });
        },
        reopen: function(theme: Theme) {
            $.ajax({
                url: "/api/themes/" + theme.id + "?v=0.0.1",
                data: {
                    status: types.ThemeStatus.open
                },
                cache: false,
                type: "put",
            }).then((data: types.Response) => {
                if (data.isSuccess) {
                    base.vueHead.showAlert(true, "success");
                } else {
                    base.vueHead.showAlert(false, data.errorMessage);
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
                url: "/api/themes/" + theme.id + "?v=0.0.1",
                data: {
                    title: self.titleInEditing,
                    detail: self.detailInEditing,
                },
                cache: false,
                type: "put",
            }).then((data: types.Response) => {
                if (data.isSuccess) {
                    base.vueHead.showAlert(true, "success");

                    self.cancel(theme);
                } else {
                    base.vueHead.showAlert(false, data.errorMessage);
                }
            });
        },
        clickOpen: function() {
            let self: VueBodyModel = this;

            self.isOpen = !self.isOpen;
        },
        clickClosed: function() {
            let self: VueBodyModel = this;

            self.isClosed = !self.isClosed;
        },
        clickShowCreate: function() {
            let self: VueBodyModel = this;

            self.showCreate = !self.showCreate;
        },
        clickOrder: function(order: types.ThemeOrderType) {
            let self: VueBodyModel = this;

            self.order = order;
        },
    },
});

declare let Clipboard;
declare let socket;

$(document).ready(function() {
    let clipboard = new Clipboard(".clip");

    clipboard.on("success", e => {
        base.vueHead.showAlert(true, "emails copied:" + e.text);
    });

    base.vueHead.authenticate(error => {
        if (error) {
            console.log(error);
        }

        vueBody.getOrganizationsCurrentUserIn();
        setInterval(vueBody.setThemeTimeText, 10000);

        socket.on(types.pushEvents.themeCreated, (theme: Theme) => {
            if (theme.organizationId === vueBody.currentOrganizationId) {
                vueBody.initTheme(theme);
                vueBody.themes.unshift(theme);
            }
        });

        socket.on(types.pushEvents.themeUpdated, (theme: Theme) => {
            if (theme.organizationId === vueBody.currentOrganizationId) {
                let index = _.findIndex(vueBody.themes, t => t.id === theme.id);
                if (index > -1) {
                    vueBody.initTheme(theme);
                    vueBody.themes["$set"](index, theme);
                }
            }
        });

        let w = $(window);
        let d = $(document);
        w.scroll(function() {
            if (w.scrollTop() >= d.height() - w.height()
                && vueBody.canShowMoreThemes) {
                vueBody.showMoreThemes();
            }
        });
    });
});
