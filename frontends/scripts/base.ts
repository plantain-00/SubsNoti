/// <reference path="../../typings/tsd.d.ts" />

declare let Vue;

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

Vue.config.debug = true;

interface CurrentUserResponse extends interfaces.CurrentUserResponse, interfaces.Response {

}

export const sessionStorageNames = {
    loginResult: "loginResult"
};

export const localStorageNames = {
    lastSuccessfulEmailTime: "lastSuccessfulEmailTime",
    lastOrganizationId: "lastOrganizationId",
    lastLoginEmail: "lastLoginEmail",
    lastLoginName: "lastLoginName"
};

export let itemLimit = 10;
export let maxOrganizationNumberUserCanCreate = 3;
export let imageServerUrl = 'http://115.29.42.125:7777';
export let imageUploaderUrl = 'http://127.0.0.1:9999';

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
            data: {
                v: "0.0.1"
            },
            cache: false,
            success: function(data: CurrentUserResponse) {
                window.sessionStorage.setItem(sessionStorageNames.loginResult, JSON.stringify(data));

                next(data);
            }
        });
    }
}

interface VueHeadModel {
    loginStatus: enums.LoginStatus;
    currentUserId: string;
    currentUserName: string;
    currentUserEmail: string;
    createdOrganizationCount: number;
    joinedOrganizationCount: number;
    requestCount: number;
    alertIsSuccess: boolean;
    showAlertMessage: boolean;
    alertMessage: string;

    canCreateOrganization: boolean;
    avatarUrl: string;
    canInvite: boolean;

    showAlert: (isSuccess: boolean, message: string) => void;
    exit: () => void;
    authenticate: (next: (error: Error, data: CurrentUserResponse) => void) => void
}

let timeoutId: NodeJS.Timer;

export let vueHead: VueHeadModel = new Vue({
    el: "#vue-head",
    data: {
        loginStatus: enums.LoginStatus.unknown,
        currentUserId: "",
        currentUserName: "",
        currentUserEmail: "",
        createdOrganizationCount: maxOrganizationNumberUserCanCreate,
        joinedOrganizationCount: 0,
        requestCount: 0,
        alertIsSuccess: true,
        showAlertMessage: false,
        alertMessage: ""
    },
    computed: {
        canCreateOrganization: function() {
            let self: VueHeadModel = this;

            return self.createdOrganizationCount < maxOrganizationNumberUserCanCreate;
        },
        avatarUrl: function() {
            let self: VueHeadModel = this;

            return `${imageServerUrl}/avatar-${self.currentUserId}.png`
        },
        canInvite: function() {
            let self: VueHeadModel = this;

            return self.joinedOrganizationCount > 0;
        }
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
                url: "/api/user/logged_in?v=0.0.1",
                cache: false,
                success: function() {
                    self.loginStatus = enums.LoginStatus.fail;
                    self.currentUserId = "";
                    self.currentUserName = "";
                    self.currentUserEmail = "";
                    window.sessionStorage.removeItem("loginResult");
                    self.createdOrganizationCount = maxOrganizationNumberUserCanCreate;
                    self.joinedOrganizationCount = 0;
                }
            });
        },
        authenticate: function(next: (error: Error, data: CurrentUserResponse) => void) {
            let self: VueHeadModel = this;

            getCurrentUser(data=> {
                if (data.isSuccess) {
                    self.loginStatus = enums.LoginStatus.success;
                    self.currentUserId = data.id;
                    self.currentUserName = data.name;
                    self.currentUserEmail = data.email;
                    self.createdOrganizationCount = data.createdOrganizationCount;
                    self.joinedOrganizationCount = data.joinedOrganizationCount;

                    window.localStorage.setItem(localStorageNames.lastLoginEmail, data.email);
                    window.localStorage.setItem(localStorageNames.lastLoginName, data.name);

                    next(null, data);
                } else {
                    self.loginStatus = enums.LoginStatus.fail;
                    next(new Error(data.errorMessage), null);
                }
            });
        }
    }
});

$(document).ajaxSend(() => {
    vueHead.requestCount++;
}).ajaxComplete(() => {
    vueHead.requestCount--;
});