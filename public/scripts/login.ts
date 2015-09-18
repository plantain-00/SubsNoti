declare const Vue;
declare const $;

import base = require("./base");
import interfaces = require("../../interfaces/interfaces");

let vueBody;
const vueBodyModel = new Vue({
    el: "#vue-body",
    data: {
        emailHead: "",
        emailTail: "",
        innerName: "",
        loginText: "Please input email",
        isSending: false,
        innerRawEmail: ""
    },
    computed: {
        rawEmail: {
            get: function () {
                return this.innerRawEmail;
            },
            set: function (value) {
                if (/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(value)) {
                    var tmp = value.trim().toLowerCase().split("@");
                    this.emailHead = tmp[0];
                    this.emailTail = tmp[1];
                } else {
                    this.emailHead = "";
                    this.emailTail = "";
                }
                this.innerRawEmail = value;
            }
        },
        canLogin: function () {
            return this.emailHead && this.emailTail && !this.isSending;
        },
        name: {
            get: function () {
                if (this.innerName) {
                    return this.innerName;
                }
                return this.emailHead;
            },
            set: function (value) {
                this.innerName = value.trim();
            }
        }
    },
    methods: {
        login: function () {
            const lastSuccessfulEmailTime = window.localStorage.getItem("lastSuccessfulEmailTime");
            if (lastSuccessfulEmailTime) {
                const time = new Date().getTime() - parseInt(lastSuccessfulEmailTime);
                if (time < 60 * 1000) {
                    alert("please do it after " + time / 1000 + " seconds");
                    return;
                }
            }
            this.isSending = true;
            this.loginText = "is sending email now...";
            const self = this;
            $.ajax({
                url: "/api/authentication_credential",
                data: JSON.stringify({
                    emailHead: this.emailHead,
                    emailTail: this.emailTail,
                    name: this.name
                }),
                type: "POST",
                contentType: "application/json",
                success: function (data:interfaces.Response) {
                    self.isSending = false;
                    self.loginText = "Please input email";
                    if (data.isSuccess) {
                        alert("success, please check your email.");
                        window.localStorage.setItem("lastSuccessfulEmailTime", new Date().getTime().toString());
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
        if (error) {
            return
        }

        alert("You are already logged in, will be redirect to home page now.");
        location.href = "/";
    });
});