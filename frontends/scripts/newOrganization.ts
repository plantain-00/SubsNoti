import * as base from "./base";
import * as interfaces from "../../common/interfaces";

declare let Vue;

interface VueBodyModel {
    organizationName: string;
    addText: string;
    isSending: boolean;

    canAdd: boolean;

    add: () => void;
}

let vueBody = new Vue({
    el: "#vue-body",
    data: {
        organizationName: "",
        addText: "Please input organization name",
        isSending: false
    },
    computed: {
        canAdd: function(): boolean {
            let self: VueBodyModel = this;

            return self.organizationName.trim() && !self.isSending;
        }
    },
    methods: {
        add: function() {
            let self: VueBodyModel = this;

            self.isSending = true;
            self.addText = "is adding now...";

            $.post("/api/user/organizations", {
                organizationName: self.organizationName
            }, function(data: interfaces.Response) {
                self.isSending = false;
                self.addText = "Please input organization name";
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
    });
});