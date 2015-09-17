declare let Vue;
declare let $;

import base = require("./base");

let vueBody;
const vueBodyModel = new Vue({
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
            const self = this;
            $.ajax({
                url: "/api/organization",
                data: JSON.stringify({
                    organizationName: this.organizationName
                }),
                type: "POST",
                contentType: "application/json",
                success: function (data) {
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
});

$(document).ready(function () {
    vueBody = new Vue(vueBodyModel);

    base.authenticate((error, data)=> {
    });
});