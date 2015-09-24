import * as libs from "./libs";
import * as settings from "./settings";

import * as enums from "./enums/enums";
import * as interfaces from "./interfaces/interfaces";

import * as services from "./services/services";

import * as controllers from "./controllers/controllers";

export function apply(app:libs.Application) {
    controllers.authenticationCredential.route(app);
    controllers.currentUser.route(app);
    controllers.organization.route(app);
}