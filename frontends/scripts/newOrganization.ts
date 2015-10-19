import * as base from "./base";
import * as interfaces from "../../common/interfaces";

declare let Vue;

interface VueBodyModel {
    organizationName: string;

    canAdd: boolean;

    add: () => void;
}

let vueBody = new Vue({
    el: "#vue-body",
    data: {
        organizationName: ""
    },
    computed: {
        canAdd: function(): boolean {
            let self: VueBodyModel = this;

            return self.organizationName.trim() && base.vueHead.requestCount === 0;
        }
    },
    methods: {
        add: function() {
            let self: VueBodyModel = this;

            $.post("/api/user/organizations", {
                organizationName: self.organizationName
            }, function(data: interfaces.Response) {
                if (data.isSuccess) {
                    alert("success.");
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
        }
    });
});
