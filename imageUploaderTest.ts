import * as types from "./types";
import * as settings from "./settings";

settings.currentEnvironment = types.environment.test;

import * as imageUploaderRouter from "./imageUploaderRouter";

imageUploaderRouter.route();
