'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services"

function createIfNotExists(id: string, next: (error: Error) => void) {
	let seed: string = libs.md5(id);
	let filePath = libs.path.join(__dirname, "../../public/avatars/" + id + ".png");
	libs.fs.stat(filePath, (error, stats) => {
		if (error) {
			create(seed, filePath, next);
		}
		else {
			next(null);
		}
	});
}

function create(seed: string, filePath: string, next: (error: Error) => void) {
	let red = seed.substr(0, 2);
	let blue = seed.substr(2, 2);
	let green = seed.substr(4, 2);
	let color = "#" + red + blue + green;

	let points = parseInt(seed.substr(6, 4), 16);

	let canvas = new libs.Canvas(420, 420);
	let context: CanvasRenderingContext2D = canvas.getContext('2d');
	context.fillStyle = "#F0F0F0";
	context.fillRect(0, 0, 420, 420);

	context.fillStyle = color;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 5; j++) {
			if ((points & 1) === 1) {
				context.fillRect(35 + i * 70, 35 + j * 70, 70, 70);
				context.fillRect(315 - i * 70, 35 + j * 70, 70, 70);
			}

			points = points >> 1;
		}
	}

	canvas.toBuffer(function(error, buf) {
		if (error) {
			next(error);
		}
		else {
			libs.fs.writeFile(filePath, buf, next);
		}
	});
}

/**
 * if exists, do nothing, otherwise create one and save it.
 */
export let createIfNotExistsAsync = services.promise.promisify2<string, void>(createIfNotExists);
