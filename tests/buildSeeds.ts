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
if (!seeds.newName) {
    seeds.newName = faker.internet.userName();
}
if (!seeds.clientEmail) {
    seeds.clientEmail = faker.internet.email();
}
if (!seeds.clientName) {
    seeds.clientName = faker.internet.userName();
}

if (!seeds.applicationName) {
    seeds.applicationName = faker.internet.userName();
}
if (!seeds.applicationHomeUrl) {
    seeds.applicationHomeUrl = faker.internet.url();
}
if (!seeds.applicationDescription) {
    seeds.applicationDescription = faker.lorem.sentence();
}
if (!seeds.applicationAuthorizationCallbackUrl) {
    seeds.applicationAuthorizationCallbackUrl = faker.internet.url();
}

if (!seeds.newApplicationName) {
    seeds.newApplicationName = faker.internet.userName();
}
if (!seeds.newApplicationHomeUrl) {
    seeds.newApplicationHomeUrl = faker.internet.url();
}
if (!seeds.newApplicationDescription) {
    seeds.newApplicationDescription = faker.lorem.sentence();
}
if (!seeds.newApplicationAuthorizationCallbackUrl) {
    seeds.newApplicationAuthorizationCallbackUrl = faker.internet.url();
}

libs.fs.writeFile("./tests/seeds.json", JSON.stringify(seeds, null, "    "), error => {
    if (error) {
        console.log(libs.colors.red(<any>error));
    }
});
