import libs = require("./libs");
import settings = require("./settings");
import enums = require("./enums/enums");
import interfaces = require("./interfaces/interfaces");
import services = require("./services/services");

const app = libs.express();

app.settings.env = settings.config.environment;

app.use(libs.compression());

app.use(libs.cookieParser());

app.use(libs.express.static(libs.path.join(__dirname, 'public')));

import token = require("./controllers/token");

app.post(token.createDocument.url, token.create);

app.listen(settings.config.website.port, settings.config.website.hostname, ()=> {
    console.log("Server has started at port: " + settings.config.website.port);
});