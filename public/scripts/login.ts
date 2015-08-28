declare var Vue;
declare var $;

var vue = new Vue({
    el: "#vue",
    data: {
        innerEmailHead: "",
        innerEmailTail: "",
        innerName: ""
    },
    computed: {
        canLogin: function () {
            return this.emailHead && this.emailTail;
        },
        emailHead: {
            get: function () {
                return this.innerEmailHead;
            },
            set: function (value) {
                this.innerEmailHead = value.trim();
            }
        },
        emailTail: {
            get: function () {
                return this.innerEmailTail;
            },
            set: function (value) {
                this.innerEmailTail = value.trim();
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
                    if (data.isSuccess) {
                        alert("success, please check your email.");
                    } else {
                        alert(data.error_message);
                    }
                }
            });
        }
    }
});