/// <reference path="./typings/tsd.d.ts" />

import gulp = require('gulp');
const del = require('del');

import libs = require("./libs");
import settings = require("./settings");

import enums = require("./enums/enums");
import interfaces = require("./interfaces/interfaces");

import services = require("./services/services");

import controllers = require("./controllers/controllers");

import docs = require("./docs");

gulp.task('clean', ()=> {
    del(['./*.js',
        './controllers/*.js',
        './demos/*.js',
        './enums/*.js',
        './interfaces/*.js',
        './services/*.js',
        './tests/*.js',
        './public/**/*.html',
        './public/**/*.css',
        './public/**/*.js',
        './publish/*']);
});

gulp.task('publish', ()=> {
    gulp.src('./app.js')
        .pipe(gulp.dest('./publish/'));
    gulp.src('./libs.js')
        .pipe(gulp.dest('./publish/'));
    gulp.src('./docs.js')
        .pipe(gulp.dest('./publish/'));
    gulp.src('./router.js')
        .pipe(gulp.dest('./publish/'));

    gulp.src('./enums/enums.js')
        .pipe(gulp.dest('./publish/enums/'));
    gulp.src('./interfaces/interfaces.js')
        .pipe(gulp.dest('./publish/interfaces/'));
    gulp.src('./services/*.js')
        .pipe(gulp.dest('./publish/services/'));
    gulp.src('./controllers/*.js')
        .pipe(gulp.dest('./publish/controllers/'));

    gulp.src("./public/*.html")
        .pipe(gulp.dest("./publish/public/"));
    gulp.src("./public/scripts/*.min.js")
        .pipe(gulp.dest("./publish/public/scripts/"));
    gulp.src("./public/styles/*.min.css")
        .pipe(gulp.dest("./publish/public/styles/"));
    gulp.src("./public/doc/api/*.html")
        .pipe(gulp.dest("./publish/public/doc/api"));
});

gulp.task("document", ()=> {
    const documentsHome = {
        name: "API document",
        apis: []
    };

    var meta = '<meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1">';

    libs._.each(docs.allDocuments, (api:interfaces.ApiDocument)=> {
        api.documentUrl = "/doc/api/" + libs.md5(api.name) + ".html";
        documentsHome.apis.push("<a href='" + api.documentUrl + "'>" + api.name + "</a> -  <a href='" + api.url + "'>" + api.url + "</a> - " + api.method);

        var document = JSON.parse(JSON.stringify(api));

        document.url = "<a href='" + api.url + "'>" + api.url + "</a>";

        var data = meta + "<style>*{font-family: 'Courier New'}</style><title>" + document.name + "</title><pre style='font-size:16px;'>" + JSON.stringify(document, null, 4) + "</pre>";

        libs.fs.writeFile(libs.path.join(__dirname, 'public') + document.documentUrl, data, error=> {
            if (error) {
                console.log(error);
            }
        });
    });

    libs.fs.writeFile(libs.path.join(__dirname, 'public') + "/doc/api/index.html", meta + "<style>*{font-family: 'Courier New'}a:link{color:black;text-decoration: none}a:visited {color:black;text-decoration: none}a:hover {color:black;text-decoration: none}a:active {color:black;text-decoration: none}</style><title>" + documentsHome.name + "</title><pre style='font-size:16px;'>" + JSON.stringify(documentsHome, null, 4) + "</pre>", error=> {
        if (error) {
            console.log(error);
        }
    });
});
