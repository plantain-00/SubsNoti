var libs = require("./libs");
var settings = require("./settings");
var app = libs.express();
app.settings.env = settings.config.environment;
app.use(libs.compression());
app.use(libs.cookieParser());
app.use(libs.express.static(libs.path.join(__dirname, 'public')));
app.listen(settings.config.website.port, settings.config.website.hostname, function () {
    console.log("Server has started at port: " + settings.config.website.port);
});
//# sourceMappingURL=app.js.map