declare var Vue;
declare var $;

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

var vueHeadModel = {
    el: "#vue-head",
    data: {
        loginStatus: 0,
        currentUserName: ""
    }
};

export var vueHead = new Vue(vueHeadModel);