import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

libs.bcrypt.genSalt(function(error, salt) {
	if (error) {
		console.log(error);
		return;
	}

	console.log("salt:" + salt);

	libs.bcrypt.hash('ABCDE', salt, function(error, hash) {
		if (error) {
			console.log(error);
			return;
		}

        console.log("hash:" + hash);

		libs.bcrypt.compare('ABCDE', hash, function(err, res) {
			console.log("res:" + res)
		});
    });
});