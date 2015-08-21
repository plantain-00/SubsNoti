var libs = require("./libs");
var settings = require("./settings");
var app = libs.express();
app.settings.env = settings.config.environment;
app.use(libs.compression());
app.use(libs.cookieParser());
app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({ extended: true }));
app.use(libs.express.static(libs.path.join(__dirname, 'public')));
var token = require("./controllers/token");
app.post(token.generateDocument.url, token.generate);
app.get(token.acceptDocument.url, token.accept);
app.get(token.validateDocument.url, token.validate);
app.listen(settings.config.website.port, settings.config.website.innerHostName, function () {
    console.log("Server has started at port: " + settings.config.website.port);
});
//# sourceMappingURL=app.js.map