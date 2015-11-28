/// <reference path="./typings/tsd.d.ts" />

"use strict";

import * as gulp from "gulp";
let shell = require("gulp-shell");
let tslint = require("gulp-tslint");
let liveServer = require("live-server");
let pjson = require("./package.json");

var types = require("./common/types");

let command = "tsc --pretty && gulp build-backends-package"

gulp.task("build", shell.task("gulp build-backends && mocha publish/backends/tests && gulp tslint"));

gulp.task("build-backends", shell.task("tsc -p backends --pretty && gulp build-backends-package"));

gulp.task("build-backends-package", () => {
    gulp.src("package.json")
        .pipe(gulp.dest("publish/"));
});

gulp.task("tslint", () => {
    return gulp.src(["common/**/*.ts", "backends/**/*.ts"])
        .pipe(tslint({
            tslint: require("tslint")
        }))
        .pipe(tslint.report("prose", { emitError: true }));
});

gulp.task("host-api", shell.task("node publish/backends/api.js"));

gulp.task("host-imageUploader", shell.task("node publish/backends/imageUploader.js"));
