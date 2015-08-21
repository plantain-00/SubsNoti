import libs = require("./libs");
import settings = require("./settings");

const app:libs.Application = libs.express();

app.settings.env = settings.config.environment;

app.use(libs.compression());

app.use(libs.cookieParser());

app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({extended: true}));

app.use(libs.express.static(libs.path.join(__dirname, 'public')));

import router = require("./router");
router.apply(app);

app.listen(settings.config.website.port, settings.config.website.innerHostName, ()=> {
    console.log("Server has started at port: " + settings.config.website.port);
});