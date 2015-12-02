"use strict";

let gulp = require("gulp");
let shell = require("gulp-shell");
let tslint = require("gulp-tslint");
let liveServer = require("live-server");
let mkdirp = require("mkdirp");

mkdirp("images/tmp", error => {
    if (error) {
        console.log(error);
    }
});

mkdirp("test_images/tmp", error => {
    if (error) {
        console.log(error);
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

gulp.task("host", shell.task("node apiDevelopment.js"));

gulp.task("host-api-test", shell.task("node apiTest.js"));

gulp.task("host-imageUploader", shell.task("node imageUploader.js"));

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
