"use strict";

import * as types from "./types";
import * as settings from "./settings";

settings.currentEnvironment = types.environment.production;

import * as apiRouter from "./apiRouter";

apiRouter.route();
