/// <reference path="../../typings/tsd.d.ts" />

declare let Vue;
declare let version;

import * as types from "../../common/types";

Vue.config.debug = true;

interface CurrentUserResponse extends types.CurrentUserResponse, types.Response {

}

type LoginStatus = "unknown" | "fail" | "success";

export const loginStatus = {
    unknown: <LoginStatus>"unknown",
    fail: <LoginStatus>"fail",
    success: <LoginStatus>"success",
};

export const sessionStorageNames = {
    loginResult: "loginResult"
};

export const localStorageNames = {
    lastSuccessfulEmailTime: "lastSuccessfulEmailTime",
    lastOrganizationId: "lastOrganizationId",
    lastLoginEmail: "lastLoginEmail",
    lastLoginName: "lastLoginName",
};

export let itemLimit = 10;
export let maxOrganizationNumberUserCanCreate = 3;
export let imageServerUrl = "http://115.29.42.125:7777";
export let imageUploaderUrl = "http://115.29.42.125:9999";

export function getFullUrl(avatar: string): string {
    return `${imageServerUrl}/${avatar}`;
}

function getUrlParameter(name: string): string {
    let reg: RegExp = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let array: RegExpMatchArray = window.location.search.substr(1).match(reg);
    if (array && array.length >= 3) {
        return decodeURI(array[2]);
    }
    return null;
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

export function guid() {
    return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}

export function isEmail(s: string): boolean {
    return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(s);
}

function getCurrentUser(next: (data: CurrentUserResponse) => void) {
    let willClearPreviousStatus = getUrlParameter("clear_previous_status");

    let loginResult;

    if (willClearPreviousStatus === "√") {
        window.sessionStorage.removeItem(sessionStorageNames.loginResult);
    } else {
        loginResult = window.sessionStorage.getItem(sessionStorageNames.loginResult);
    }

    if (loginResult) {
        let data: CurrentUserResponse = JSON.parse(loginResult);

        next(data);
    } else {
        $.ajax({
            url: "/api/user",
            cache: false,
        }).then((data: CurrentUserResponse) => {
            window.sessionStorage.setItem(sessionStorageNames.loginResult, JSON.stringify(data));

            next(data);
        });
    }
}

interface VueHeadModel {
    loginStatus: LoginStatus;
    currentUserId: string;
    currentUserName: string;
    currentUserEmail: string;
    currentAvatar: string;
    createdOrganizationCount: number;
    joinedOrganizationCount: number;
    requestCount: number;
    alertIsSuccess: boolean;
    showAlertMessage: boolean;
    alertMessage: string;

    canCreateOrganization: boolean;
    canInvite: boolean;

    showAlert: (isSuccess: boolean, message: string) => void;
    exit: () => void;
    authenticate: (next: (error: Error) => void) => void;
}

let timeoutId: NodeJS.Timer;

export let vueHead: VueHeadModel = new Vue({
    el: "#vue-head",
    data: {
        loginStatus: loginStatus.unknown,
        currentUserId: "",
        currentUserName: "",
        currentUserEmail: "",
        currentAvatar: "",
        createdOrganizationCount: maxOrganizationNumberUserCanCreate,
        joinedOrganizationCount: 0,
        requestCount: 0,
        alertIsSuccess: true,
        showAlertMessage: false,
        alertMessage: "",
    },
    computed: {
        canCreateOrganization: function() {
            let self: VueHeadModel = this;

            return self.createdOrganizationCount < maxOrganizationNumberUserCanCreate;
        },
        canInvite: function() {
            let self: VueHeadModel = this;

            return self.joinedOrganizationCount > 0;
        },
    },
    methods: {
        showAlert: function(isSuccess: boolean, message: string) {
            let self: VueHeadModel = this;

            self.alertIsSuccess = isSuccess;
            self.alertMessage = message;
            self.showAlertMessage = true;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                self.showAlertMessage = false;
                timeoutId = null;
            }, 3000);
        },
        exit: function() {
            let self: VueHeadModel = this;

            $.ajax({
                type: "DELETE",
                url: "/api/user/logged_in",
                cache: false,
            }).then((data: CurrentUserResponse) => {
                if (data.isSuccess) {
                    self.loginStatus = loginStatus.fail;
                    self.currentUserId = "";
                    self.currentUserName = "";
                    self.currentUserEmail = "";
                    self.currentAvatar = "";
                    window.sessionStorage.removeItem(sessionStorageNames.loginResult);
                    self.createdOrganizationCount = maxOrganizationNumberUserCanCreate;
                    self.joinedOrganizationCount = 0;
                } else {
                    self.showAlert(false, data.errorMessage);
                }
            });
        },
        authenticate: function(next: (error: Error) => void) {
            let self: VueHeadModel = this;

            getCurrentUser(data => {
                if (data.isSuccess) {
                    self.loginStatus = loginStatus.success;
                    self.currentUserId = data.id;
                    self.currentUserName = data.name;
                    self.currentUserEmail = data.email;
                    self.currentAvatar = getFullUrl(data.avatar);
                    self.createdOrganizationCount = data.createdOrganizationCount;
                    self.joinedOrganizationCount = data.joinedOrganizationCount;

                    window.localStorage.setItem(localStorageNames.lastLoginEmail, data.email);
                    window.localStorage.setItem(localStorageNames.lastLoginName, data.name);

                    next(null);
                } else {
                    self.loginStatus = loginStatus.fail;
                    next(new Error(data.errorMessage));
                }
            });
        },
    },
});

$(document).ajaxSend(() => {
    vueHead.requestCount++;
}).ajaxComplete(() => {
    vueHead.requestCount--;
}).ajaxError(() => {
    vueHead.showAlert(false, "something happens unexpectedly, see console to get more details.");
});

$.ajaxSetup({
    headers: {
        "X-Version": version
    },
});
