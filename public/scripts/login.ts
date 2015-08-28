declare
var Vue;
declare
var $;

import base = require("./base");

var vue;
var vueModel = new Vue({
    el: "#vue",
    data: {
        innerEmailHead: "",
        innerEmailTail: "",
        innerName: "",
        loginText: "Please input email",
        isSending: false
    },
    computed: {
        canLogin: function () {
            return this.emailHead && this.emailTail && !this.isSending;
        },
        emailHead: {
            get: function () {
                return this.innerEmailHead;
            },
            set: function (value) {
                this.innerEmailHead = value.trim().toLowerCase();
            }
        },
        emailTail: {
            get: function () {
                return this.innerEmailTail;
            },
            set: function (value) {
                this.innerEmailTail = value.trim().toLowerCase();
            }
        },
        name: {
            get: function () {
                if (this.innerName) {
                    return this.innerName;
                }
                return this.innerEmailHead;
            },
            set: function (value) {
                this.innerName = value.trim();
            }
        }
    },
    methods: {
        login: function () {
            this.isSending = true;
            this.loginText = "is sending email now...";
            var self = this;
            $.ajax({
                url: "/api/authentication_credential",
                data: JSON.stringify({
                    emailHead: this.emailHead,
                    emailTail: this.emailTail,
                    name: this.name
                }),
                type: "POST",
                contentType: "application/json",
                success: function (data) {
                    self.isSending = false;
                    self.loginText = "Please input email";
                    if (data.isSuccess) {
                        alert("success, please check your email.");
                        location.href = "/";
                    } else {
                        alert(data.errorMessage);
                    }
                }
            });
        }
    }
});

$(document).ready(function () {
    vue = new Vue(vueModel);

    base.authenticate((error, data)=> {
        if (!error) {
            location.href = "/";
        }
    });
});