"use strict";

import * as faker from "faker";

import * as types from "../types";
import * as libs from "../libs";

let seeds: types.TestSeed = require("./seeds.json");

if (!seeds.email) {
    seeds.email = faker.internet.email();
}
if (!seeds.name) {
    seeds.name = faker.internet.userName();
}
if (!seeds.organizationName) {
    seeds.organizationName = faker.company.companyName();
}
if (!seeds.themeTitle) {
    seeds.themeTitle = faker.name.title();
}
if (!seeds.themeDetail) {
    seeds.themeDetail = faker.lorem.paragraph();
}
if (!seeds.newThemeTitle) {
    seeds.newThemeTitle = faker.name.title();
}
if (!seeds.newThemeDetail) {
    seeds.newThemeDetail = faker.lorem.paragraph();
}

libs.fs.writeFile("./tests/seeds.json", JSON.stringify(seeds, null, "    "), error => {
    if (error) {
        console.log(error);
    }
});
