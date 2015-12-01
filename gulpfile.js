"use strict";

let gulp = require("gulp");
let shell = require("gulp-shell");
let tslint = require("gulp-tslint");
let liveServer = require("live-server");

gulp.task("build", shell.task("mkdir images\\tmp || tsc --pretty && gulp tslint"));

gulp.task("deploy", shell.task("mkdir -p 'images/tmp' && tsc --pretty && gulp tslint"));

gulp.task("tslint", () => {
    return gulp.src(["controllers/**/*.ts", "data_maintenances/*.ts", "services/*.ts", "tests/*.ts", "*.ts"])
        .pipe(tslint({
            tslint: require("tslint")
        }))
        .pipe(tslint.report("prose", { emitError: true }));
});

gulp.task("host", shell.task("node api.js"));

gulp.task("host-imageUploader", shell.task("node imageUploader.js"));

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
