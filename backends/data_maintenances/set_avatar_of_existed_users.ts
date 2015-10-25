'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as services from "../services";

services.mongo.connect();

(async() => {
	try {
		let users = await services.mongo.User.find({}).exec();
		for (let user of users) {
			console.log(user.email + " in " + users.length);
			await services.avatar.createIfNotExistsAsync(user._id.toHexString());
		}
	}
	catch (error) {
		console.log(error);
	}
})();