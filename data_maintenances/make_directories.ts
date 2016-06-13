import * as libs from "../libs";
import * as services from "../services";

const mkdirp = require("mkdirp");

mkdirp("images/tmp", error => {
    if (error) {
        services.utils.red(error);
    }
});

mkdirp("test_images/tmp", error => {
    if (error) {
        services.utils.red(error);
    }
});
