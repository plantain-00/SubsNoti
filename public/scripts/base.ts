declare const Vue;
declare const $;

export function authenticate(next:(error:Error, data:any)=>void) {
    $.ajax({
        url: "/api/current_user.json",
        data: {},
        cache: false,
        success: function (data) {
            if (data.isSuccess) {
                vueHead.$data.loginStatus = 2;
                vueHead.$data.currentUserName = data.name;
                next(null, data);
            } else {
                vueHead.$data.loginStatus = 1;
                next(new Error(data.errorMessage), null);
            }
        }
    });
}

const vueHeadModel = {
    el: "#vue-head",
    data: {
        loginStatus: 0,
        currentUserName: ""
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
                }
            });
        }
    }
};

export const vueHead = new Vue(vueHeadModel);
