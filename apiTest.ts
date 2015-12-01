"use strict";

import * as settings from "./settings";
import * as apiRouter from "./apiRouter";

settings.mongodb = settings.mongodbTest;

apiRouter.route();
