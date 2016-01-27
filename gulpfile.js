"use strict";

const gulp = require("gulp");
const shell = require("gulp-shell");
const tslint = require("gulp-tslint");
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

gulp.task("build", shell.task("tsc --pretty && gulp tslint"));

gulp.task("deploy", shell.task("tsc --pretty && gulp tslint"));

gulp.task("tslint", () => {
    return gulp.src(["controllers/**/*.ts", "data_maintenances/*.ts", "services/*.ts", "tests/*.ts", "*.ts"])
        .pipe(tslint({
            tslint: require("tslint")
        }))
        .pipe(tslint.report("prose", { emitError: true }));
});

gulp.task("host", shell.task("node apiDevelop.js"));

gulp.task("host-api-test", shell.task("node apiTest.js"));

gulp.task("host-imageUploader", shell.task("node imageUploaderDevelop.js"));

gulp.task("host-imageUploader-test", shell.task("node imageUploaderTest.js"));

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
