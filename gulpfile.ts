/// <reference path="./typings/tsd.d.ts" />

"use strict";

import * as gulp from "gulp";
let del = require("del");
let rename = require("gulp-rename");
let ejs = require("gulp-ejs");
let webpack = require("webpack-stream");
let minifyHtml = require("gulp-minify-html");
let rev = require("gulp-rev");
let path = require("path");
let minifyCSS = require("gulp-minify-css");
let autoprefixer = require("autoprefixer");
let postcss = require("gulp-postcss");
let watch = require("gulp-watch");
let batch = require("gulp-batch");
let revReplace = require("gulp-rev-replace");
let shell = require("gulp-shell");
let sass = require("gulp-sass");
let tslint = require("gulp-tslint");

let pjson = require("./package.json");

gulp.task("clean", () => {
    del([
        "backends/**/*.js",

        "common/**/*.js",

        "frontends/doc/api/_book/",
        "frontends/build/",
        "frontends/scripts/*.js",

        "publish/public/doc/",
        "publish/public/scripts/",
        "publish/public/styles",
        "publish/public/*.html",
        "publish/public/*.ico",

        "publish/backends/",
        "publish/common/",
    ]);
});

let minifyHtmlConfig = {
    conditionals: true,
    spare: true,
};

import * as types from "./common/types";

let isDevelopment = process.env.NODE_ENV !== types.environment.production;

gulp.task("watch", function() {
    watch("frontends/styles/*.scss", batch(function(events, done) {
        gulp.start("css", done);
    }));
    watch("frontends/scripts/*.js", batch(function(events, done) {
        gulp.start("js", done);
    }));
    watch(["frontends/build/styles/*.css", "frontends/build/scripts/*.js"], batch(function(events, done) {
        gulp.start("rev", done);
    }));
    watch(["frontends/templates/*.ejs", "frontends/build/rev-manifest.json"], batch(function(events, done) {
        gulp.start("html", done);
    }));
    watch(["frontends/doc/api/*.md"], batch(function(events, done) {
        gulp.start("doc", done);
    }));
    watch(["frontends/doc/api/*.dot"], batch(function(events, done) {
        gulp.start("dot", done);
    }));
});

gulp.task("dot", shell.task([
    "dot -Tsvg frontends/doc/database_models.dot > publish/public/doc/database_models.svg"
]));

gulp.task("gitbook", shell.task("gitbook build frontends/doc"));

gulp.task("run", shell.task("node publish/backends/app.js"));

gulp.task("make", shell.task("tsc -p backends --pretty && gulp package && mocha publish/backends/tests && tsc -p frontends --pretty && gulp tslint && gulp scss-lint && gulp css && gulp js && gulp rev && gulp html && gulp doc && gulp dot && gulp icon"));

gulp.task("tslint", () => {
    return gulp.src(["common/**/*.ts", "backends/**/*.ts", "frontends/scripts/**/*.ts", "gulpfile.ts"])
        .pipe(tslint({
            tslint: require("tslint")
        }))
        .pipe(tslint.report("prose", { emitError: true }));
});

gulp.task("scss-lint", shell.task("scss-lint frontends/styles/*.scss"));

gulp.task("doc", ["gitbook"], () => {
    gulp.src("frontends/doc/_book/**")
        .pipe(gulp.dest("publish/public/doc/"));
});

gulp.task("icon", () => {
    gulp.src("frontends/favicon.ico")
        .pipe(gulp.dest("publish/public/"));
});

gulp.task("package", () => {
    gulp.src("package.json")
        .pipe(gulp.dest("publish/"));
});

gulp.task("css", () => {
    for (let file of ["base"]) {
        uglifyCss(file);
    }
});

gulp.task("js", () => {
    for (let file of ["index", "login", "new-organization", "invite", "user", "error", "success"]) {
        bundleAndUglifyJs(file);
    }
});

gulp.task("rev", () => {
    gulp.src(["frontends/build/styles/*.css", "frontends/build/scripts/*.js"], { base: "frontends/build/" })
        .pipe(rev())
        .pipe(gulp.dest("publish/public/"))
        .pipe(rev.manifest())
        .pipe(gulp.dest("frontends/build/"));

    gulp.src("frontends/build/scripts/*.map", { base: "frontends/build/" })
        .pipe(gulp.dest("publish/public/"));
});

gulp.task("html", () => {
    for (let file of ["index", "login", "new_organization", "invite", "user", "error", "success"]) {
        bundleAndUglifyHtml(file);
    }
});

function uglifyCss(name: string) {
    if (isDevelopment) {
        gulp.src("frontends/styles/" + name + ".scss")
            .pipe(sass())
            .pipe(postcss([autoprefixer({ browsers: ["last 2 versions"] })]))
            .pipe(rename(name + ".css"))
            .pipe(gulp.dest("frontends/build/styles/"));
    } else {
        gulp.src("frontends/styles/" + name + ".scss")
            .pipe(sass())
            .pipe(postcss([autoprefixer({ browsers: ["last 2 versions"] })]))
            .pipe(minifyCSS())
            .pipe(rename(name + ".min.css"))
            .pipe(gulp.dest("frontends/build/styles/"));
    }
}

function bundleAndUglifyJs(name: string) {
    if (isDevelopment) {
        gulp.src("frontends/scripts/" + name + ".js")
            .pipe(webpack())
            .pipe(rename(name + ".js"))
            .pipe(gulp.dest("frontends/build/scripts/"));
    } else {
        gulp.src("frontends/scripts/" + name + ".js")
            .pipe(webpack({
                plugins: [
                    new webpack.webpack.optimize.UglifyJsPlugin({ minimize: true })
                ],
                devtool: "source-map",
                output: {
                    filename: name + ".min.js"
                },
            }))
            .pipe(gulp.dest("frontends/build/scripts/"));
    }
}

function bundleAndUglifyHtml(name: string) {
    let manifest = gulp.src("frontends/build/rev-manifest.json");

    let config = {
        dotMin: ".min",
        version: pjson.version,
        environment: "",
    };

    if (isDevelopment) {
        config.dotMin = "";
        config.environment = "dev";
        gulp.src("frontends/templates/" + name + ".ejs")
            .pipe(ejs(config))
            .pipe(rename(name + ".html"))
            .pipe(revReplace({
                manifest: manifest
            }))
            .pipe(gulp.dest("publish/public/"));
    } else {
        gulp.src("frontends/templates/" + name + ".ejs")
            .pipe(ejs(config))
            .pipe(minifyHtml(minifyHtmlConfig))
            .pipe(rename(name + ".html"))
            .pipe(revReplace({
                manifest: manifest
            }))
            .pipe(gulp.dest("publish/public/"));
    }
}
