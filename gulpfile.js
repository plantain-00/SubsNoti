"use strict";

const gulp = require("gulp");
const shell = require("gulp-shell");
const liveServer = require("live-server");
const mkdirp = require("mkdirp");
const colors = require("colors");

mkdirp("images/tmp", error => {
    if (error) {
        console.log(colors.red(error));
    }
});

mkdirp("test_images/tmp", error => {
    if (error) {
        console.log(colors.red(error));
    }
});

gulp.task("host-imageServer", () => {
    liveServer.start({
        port: 7777,
        host: "0.0.0.0",
        root: "images",
        open: false,
        ignore: "",
        wait: 500,
    });
});

gulp.task("host-imageServer-test", () => {
    liveServer.start({
        port: 7777,
        host: "0.0.0.0",
        root: "test_images",
        open: false,
        ignore: "",
        wait: 500,
    });
});
