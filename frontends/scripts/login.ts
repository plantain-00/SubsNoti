import * as base from "./base";
import * as interfaces from "../../common/interfaces";

declare let Vue;

interface VueBodyModel {
    emailHead: string;
    emailTail: string;
    innerName: string;
    innerRawEmail: string;

    rawEmail: string;
    canLogin: boolean;
    name: string;

    login: () => void;
}

let vueBody: VueBodyModel = new Vue({
    el: "#vue-body",
    data: {
        emailHead: "",
        emailTail: "",
        innerName: "",
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

                if (base.isEmail(value)) {
                    let tmp = value.trim().toLowerCase().split("@");
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

            return self.emailHead && self.emailTail && base.vueHead.requestCount === 0;
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

            $.post("/api/token_sent", {
                email: `${self.emailHead}@${self.emailTail}`,
                name: self.name
            }, function(data: interfaces.Response) {
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

            vueBody.rawEmail = window.localStorage.getItem(base.localStorageNames.lastLoginEmail);
            vueBody.name = window.localStorage.getItem(base.localStorageNames.lastLoginName);
            return;
        }

        alert("You are already logged in, will be redirect to home page now.");
        location.href = "/";
    });
});
