import * as base from "./base";
import * as interfaces from "../../common/interfaces";

declare let Vue;

interface VueBodyModel {
    name: string;
    email: string;

    save: () => void;
}

let vueBody: VueBodyModel = new Vue({
    el: "#vue-body",
    data: {
        name: '',
        email: ''
    },
    methods: {
        save: function() {

        }
    }
});

$(document).ready(function() {
    base.vueHead.authenticate((error, data) => {
        if (error) {
            console.log(error);
        }
        else {
            vueBody.name = base.vueHead.currentUserName;
            vueBody.email = base.vueHead.currentUserEmail;
        }
    });
});
