import * as types from "./share/types";
import * as settings from "./settings";

settings.currentEnvironment = types.environment.test;

import * as apiRouter from "./apiRouter";

apiRouter.route();
