import * as base from "./base";
import * as interfaces from "../../common/interfaces";

declare let Vue;

interface VueBodyModel {
    emailHead: string;
    emailTail: string;
    innerName: string;
    loginText: string;
    isSending: boolean;
    innerRawEmail: string;

    rawEmail: string;
    canLogin: boolean;
    name: string;

    login: () => void;
}

let vueBody = new Vue({
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
            get: function(): string {
                let self: VueBodyModel = this;

                return self.innerRawEmail;
            },
            set: function(value: string) {
                let self: VueBodyModel = this;

                if (/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(value)) {
                    var tmp = value.trim().toLowerCase().split("@");
                    self.emailHead = tmp[0];
                    self.emailTail = tmp[1];
                } else {
                    self.emailHead = "";
                    self.emailTail = "";
                }
                self.innerRawEmail = value;
            }
        },
        canLogin: function(): boolean {
            let self: VueBodyModel = this;

            return self.emailHead && self.emailTail && !self.isSending;
        },
        name: {
            get: function(): string {
                let self: VueBodyModel = this;

                if (self.innerName) {
                    return self.innerName;
                }
                return self.emailHead;
            },
            set: function(value: string) {
                let self: VueBodyModel = this;

                self.innerName = value.trim();
            }
        }
    },
    methods: {
        login: function() {
            let self: VueBodyModel = this;

            let lastSuccessfulEmailTime: string = window.localStorage.getItem(base.localStorageNames.lastSuccessfulEmailTime);
            if (lastSuccessfulEmailTime) {
                let time = new Date().getTime() - parseInt(lastSuccessfulEmailTime);
                if (time < 60 * 1000) {
                    alert("please do it after " + (60 - time / 1000) + " seconds");
                    return;
                }
            }
            self.isSending = true;
            self.loginText = "is sending email now...";
            $.post("/api/token_sent", {
                emailHead: self.emailHead,
                emailTail: self.emailTail,
                name: self.name
            }, function(data: interfaces.Response) {
                self.isSending = false;
                self.loginText = "Please input email";
                if (data.isSuccess) {
                    alert("success, please check your email.");
                    window.localStorage.setItem(base.localStorageNames.lastSuccessfulEmailTime, new Date().getTime().toString());
                } else {
                    alert(data.errorMessage);
                }
            });
        }
    }
});

$(document).ready(function() {
    base.vueHead.authenticate((error, data) => {
        if (error) {
            console.log(error);
            return;
        }

        alert("You are already logged in, will be redirect to home page now.");
        location.href = "/";
    });
});
