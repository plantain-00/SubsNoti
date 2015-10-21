/// <reference path="../../typings/tsd.d.ts" />

declare let Vue;

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

Vue.config.debug = true;

interface CurrentUserResponse extends interfaces.CurrentUserResponse, interfaces.Response {

}

export let sessionStorageNames = {
    loginResult: "loginResult"
};

export let localStorageNames = {
    lastSuccessfulEmailTime: "lastSuccessfulEmailTime",
    lastOrganizationId: "lastOrganizationId",
    lastLoginEmail: "lastLoginEmail",
    lastLoginName: "lastLoginName"
};

export let itemLimit = 10;
export let maxOrganizationNumberUserCanCreate = 3;

function getUrlParameter(name: string): string {
    var reg: RegExp = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var array: RegExpMatchArray = window.location.search.substr(1).match(reg);
    if (array && array.length >= 3) {
        return decodeURI(array[2]);
    }
    return null;
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
            data: {},
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
    requestCount: number;

    canCreateOrganization: boolean;

    exit: () => void;
    authenticate: (next: (error: Error, data: CurrentUserResponse) => void) => void
}

export let vueHead: VueHeadModel = new Vue({
    el: "#vue-head",
    data: {
        loginStatus: enums.LoginStatus.unknown,
        currentUserId: "",
        currentUserName: "",
        currentUserEmail: "",
        createdOrganizationCount: maxOrganizationNumberUserCanCreate,
        requestCount: 0
    },
    computed: {
        canCreateOrganization: function() {
            let self: VueHeadModel = this;

            return self.createdOrganizationCount < maxOrganizationNumberUserCanCreate;
        }
    },
    methods: {
        exit: function() {
            let self: VueHeadModel = this;

            $.ajax({
                type: "DELETE",
                url: "/api/user/logged_in",
                cache: false,
                success: function() {
                    self.loginStatus = enums.LoginStatus.fail;
                    self.currentUserName = "";
                    self.currentUserEmail = "";
                    window.sessionStorage.removeItem("loginResult");
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