import * as base from "./base";
import * as interfaces from "../../interfaces/interfaces";

let vueBody;
let vueBodyModel = {
    el: "#vue-body",
    data: {
        organizationName: "",
        addText: "Please input organization name",
        isSending: false
    },
    computed: {
        canAdd: function () {
            return this.organizationName.trim() && !this.isSending;
        }
    },
    methods: {
        add: function () {
            this.isSending = true;
            this.loginText = "is adding now...";
            let self = this;
            $.ajax({
                url: "/api/user/organizations",
                data: JSON.stringify({
                    organizationName: this.organizationName
                }),
                type: "POST",
                contentType: "application/json",
                success: function (data:interfaces.Response) {
                    self.isSending = false;
                    self.loginText = "Please input organization name";
                    if (data.isSuccess) {
                        alert("success.");
                    } else {
                        alert(data.errorMessage);
                    }
                }
            });
        }
    }
};

$(document).ready(function () {
    vueBody = new Vue(vueBodyModel);

    base.authenticate((error, data)=> {
    });
});