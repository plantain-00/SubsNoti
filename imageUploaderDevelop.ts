import * as types from "./share/types";
import * as settings from "./settings";

settings.setEnvironment(types.environment.development);

import * as imageUploaderRouter from "./imageUploaderRouter";

imageUploaderRouter.route();
