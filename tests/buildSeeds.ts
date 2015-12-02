"use strict";

import * as faker from "faker";

import * as libs from "../libs";

let seeds = {
    email: faker.internet.email(),
    name: faker.internet.userName(),
};

libs.fs.writeFile("./tests/seeds.json", JSON.stringify(seeds, null, "    "), error => {
    if (error) {
        console.log(error);
    }
});
