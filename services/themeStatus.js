"use strict";
const types = require("../share/types");
const services = require("../services");
function getType(status) {
    if (status === 0 /* open */) {
        return types.themeStatus.open;
    }
    if (status === 1 /* closed */) {
        return types.themeStatus.closed;
    }
    throw services.error.fromMessage("invalid theme status:" + status, 500 /* internalServerError */);
}
exports.getType = getType;
