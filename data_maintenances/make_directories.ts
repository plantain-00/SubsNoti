import * as libs from "../libs";

const mkdirp = require("mkdirp");

mkdirp("images/tmp", error => {
    if (error) {
        libs.red(error);
    }
});

mkdirp("test_images/tmp", error => {
    if (error) {
        libs.red(error);
    }
});
