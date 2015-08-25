import libs = require("./libs");
import settings = require("./settings");

import services = require("./services/services");

const app:libs.Application = libs.express();

app.settings.env = settings.config.environment;

app.use(libs.compression());

app.use(libs.cookieParser());

app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({extended: true}));

app.use(libs.express.static(libs.path.join(__dirname, 'public')));

import router = require("./router");
router.apply(app);

libs.mongodb.MongoClient.connect(settings.config.mongodb.url, (error, db)=> {
    if (error) {
        console.log(error);
        return;
    }

    db.authenticate(settings.config.mongodb.user, settings.config.mongodb.password, (error)=> {
        if (error) {
            console.log(error);
            return;
        }

        services.logger.logs = db.collection("logs");
    });
});

services.cache.client = libs.redis.createClient(settings.config.redis.port, settings.config.redis.host, settings.config.redis.options);
services.cache.client.on("error", error=> {
    console.log(error);
});

app.listen(settings.config.website.port, settings.config.website.innerHostName, ()=> {
    console.log("Server has started at port: " + settings.config.website.port);
});