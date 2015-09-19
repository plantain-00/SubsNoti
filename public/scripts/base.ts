declare const Vue;
declare const $;

import interfaces = require("../../interfaces/interfaces");
interface GetCurrentUserResponse extends interfaces.GetCurrentUserRespopnse,interfaces.Response {

}

export const sessionStorageNames = {
    loginResult: "loginResult"
};

export const localStorageNames = {
    lastSuccessfulEmailTime: "lastSuccessfulEmailTime"
};

function getUrlParameter(name:string):string {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURI(r[2]);
    }
    return null;
}

function getCurrentUser(next:(data:GetCurrentUserResponse)=>void) {
    const willClearPreviousStatus = getUrlParameter("clear_previous_status");

    let loginResult = null;

    if (willClearPreviousStatus == "√") {
        window.sessionStorage.removeItem(sessionStorageNames.loginResult);
    } else {
        loginResult = window.sessionStorage.getItem(sessionStorageNames.loginResult);
    }

    if (loginResult) {
        const data:GetCurrentUserResponse = JSON.parse(loginResult);
        next(data);
    } else {
        $.ajax({
            url: "/api/current_user.json",
            data: {},
            cache: false,
            success: function (data:GetCurrentUserResponse) {
                window.sessionStorage.setItem(sessionStorageNames.loginResult, JSON.stringify(data));

                next(data);
            }
        });
    }
}

export function authenticate(next:(error:Error, data:GetCurrentUserResponse)=>void) {
    getCurrentUser(data=> {
        if (data.isSuccess) {
            vueHead.$data.loginStatus = 2;
            vueHead.$data.currentUserName = data.name;
            vueHead.$data.canCreateOrganization = data.canCreateOrganization;

            next(null, data);
        } else {
            vueHead.$data.loginStatus = 1;
            next(new Error(data.errorMessage), null);
        }
    });
}

const vueHeadModel = {
    el: "#vue-head",
    data: {
        loginStatus: 0,
        currentUserName: "",
        canCreateOrganization: false
    },
    methods: {
        exit: function () {
            var self = this;
            $.ajax({
                type: "DELETE",
                url: "/api/authentication_credential",
                cache: false,
                success: function () {
                    self.loginStatus = 1;
                    self.currentUserName = "";
                    window.sessionStorage.removeItem("loginResult");
                }
            });
        }
    }
};

export const vueHead = new Vue(vueHeadModel);
