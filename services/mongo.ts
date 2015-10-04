import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

export function connect() {
    libs.mongoose.connect(settings.config.mongodb.url, {
        user: settings.config.mongodb.user,
        pass: settings.config.mongodb.password
    });

    libs.mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

    Logs = libs.mongoose.model('logs', new libs.mongoose.Schema({
        time: Date,
        content: libs.mongoose.Schema.Types.Mixed
    }));
}

export let Logs: libs.mongoose.Model<libs.mongoose.Document>;