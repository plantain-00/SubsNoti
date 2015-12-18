import * as faker from "faker";

import * as types from "../types";
import * as libs from "../libs";

let seeds: types.TestSeed = require("./seeds.json");

if (!seeds.user) {
    seeds.user = {
        email: faker.internet.email(),
        name: faker.internet.userName(),
    };
}

if (!seeds.organization) {
    seeds.organization = {
        name: faker.company.companyName()
    };
}

if (!seeds.theme) {
    seeds.theme = {
        title: faker.name.title(),
        detail: faker.lorem.paragraph(),
    };
}

if (!seeds.newTheme) {
    seeds.newTheme = {
        title: faker.name.title(),
        detail: faker.lorem.paragraph(),
    };
}

if (!seeds.newUser) {
    seeds.newUser = {
        name: faker.internet.userName()
    };
}

if (!seeds.clientUser) {
    seeds.clientUser = {
        email: faker.internet.email(),
        name: faker.internet.userName(),
    };
}

if (!seeds.application) {
    seeds.application = {
        name: faker.internet.userName(),
        homeUrl: faker.internet.url(),
        description: faker.lorem.sentence(),
        authorizationCallbackUrl: faker.internet.url(),
    };
}

if (!seeds.newApplication) {
    seeds.newApplication = {
        name: faker.internet.userName(),
        homeUrl: faker.internet.url(),
        description: faker.lorem.sentence(),
        authorizationCallbackUrl: faker.internet.url(),
    };
}

if (!seeds.accessToken) {
    seeds.accessToken = {
        description: faker.name.title()
    };
}

if (!seeds.newAccessToken) {
    seeds.newAccessToken = {
        description: faker.name.title()
    };
}

libs.fs.writeFile("./tests/seeds.json", JSON.stringify(seeds, null, "    "), error => {
    if (error) {
        console.log(libs.colors.red(<any>error));
    }
});
