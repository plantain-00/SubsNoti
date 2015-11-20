import * as base from "./base";
import * as types from "../../common/types";

declare let Vue;

interface VueBodyModel {
    organizationName: string;

    canAdd: boolean;

    add: () => void;
}

let vueBody: VueBodyModel = new Vue({
    el: "#vue-body",
    data: {
        organizationName: ""
    },
    computed: {
        canAdd: function(): boolean {
            let self: VueBodyModel = this;

            return self.organizationName.trim() && base.vueHead.requestCount === 0;
        },
    },
    methods: {
        add: function() {
            let self: VueBodyModel = this;

            $.post("/api/organizations?v=0.0.1", {
                organizationName: self.organizationName
            }).then((data: types.Response) => {
                if (data.isSuccess) {
                    base.vueHead.createdOrganizationCount++;
                    base.vueHead.showAlert(true, "success");
                } else {
                    base.vueHead.showAlert(false, data.errorMessage);
                }
            });
        },
    },
});

$(document).ready(function() {
    base.vueHead.authenticate(error => {
        if (error) {
            console.log(error);
        }
    });
});
