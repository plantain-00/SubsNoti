import * as services from "../services";

const mkdirp = require("mkdirp");

mkdirp("images/tmp", (error: Error) => {
    if (error) {
        services.utils.red(error);
    }
});

mkdirp("test_images/tmp", (error: Error) => {
    if (error) {
        services.utils.red(error);
    }
});
