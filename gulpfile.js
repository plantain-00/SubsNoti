"use strict";

const gulp = require("gulp");
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
