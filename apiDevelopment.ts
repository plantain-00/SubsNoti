import * as types from "./types";
import * as settings from "./settings";

settings.currentEnvironment = types.environment.development;

import * as apiRouter from "./apiRouter";

apiRouter.route();
