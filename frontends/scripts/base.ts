/// <reference path="../../typings/tsd.d.ts" />

declare let Vue;

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";
import * as environment from "../../common/environment";
import {config} from "../settings";

if (config.environment == environment.developmentEnvironment) {
    Vue.config.debug = true;
}

interface GetCurrentUserResponse extends interfaces.GetCurrentUserResponse, interfaces.Response {

}

export let sessionStorageNames = {
    loginResult: "loginResult"
};

export let localStorageNames = {
    lastSuccessfulEmailTime: "lastSuccessfulEmailTime"
};

function getUrlParameter(name: string): string {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURI(r[2]);
    }
    return null;
}

function getCurrentUser(next: (data: GetCurrentUserResponse) => void) {
    let willClearPreviousStatus = getUrlParameter("clear_previous_status");

    let loginResult = null;

    if (willClearPreviousStatus == "√") {
        window.sessionStorage.removeItem(sessionStorageNames.loginResult);
    } else {
        loginResult = window.sessionStorage.getItem(sessionStorageNames.loginResult);
    }

    if (loginResult) {
        let data: GetCurrentUserResponse = JSON.parse(loginResult);
        next(data);
    } else {
        $.ajax({
            url: "/api/user",
            data: {},
            cache: false,
            success: function(data: GetCurrentUserResponse) {
                window.sessionStorage.setItem(sessionStorageNames.loginResult, JSON.stringify(data));

                next(data);
            }
        });
    }
}

export function authenticate(next: (error: Error, data: GetCurrentUserResponse) => void) {
    getCurrentUser(data=> {
        if (data.isSuccess) {
            vueHead.$data.loginStatus = enums.LoginStatus.success;
            vueHead.$data.currentUserName = data.name;
            vueHead.$data.canCreateOrganization = data.canCreateOrganization;

            next(null, data);
        } else {
            vueHead.$data.loginStatus = enums.LoginStatus.fail;
            next(new Error(data.errorMessage), null);
        }
    });
}

let vueHeadModel = {
    el: "#vue-head",
    data: {
        loginStatus: enums.LoginStatus.unknown,
        currentUserName: "",
        canCreateOrganization: false
    },
    methods: {
        exit: function() {
            var self = this;
            $.ajax({
                type: "DELETE",
                url: "/api/user/logged_in",
                cache: false,
                success: function() {
                    self.loginStatus = enums.LoginStatus.fail;
                    self.currentUserName = "";
                    window.sessionStorage.removeItem("loginResult");
                }
            });
        }
    }
};

export let vueHead = new Vue(vueHeadModel);
