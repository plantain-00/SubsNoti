var libs = require("./libs");
var services = require("./services/services");
var controllers = require("./controllers/controllers");
var docs = require("./docs");
function apply(app) {
    app.post(controllers.token.generateDocument.url, controllers.token.generate);
    app.get(controllers.token.acceptDocument.url, controllers.token.accept);
    app.get(controllers.token.validateDocument.url, controllers.token.validate);
    libs._.each(docs.notGetDocuments, function (api) {
        app.get(api.url, function (request, response) {
            services.response.sendWrongHttpMethod(response, api.documentUrl);
        });
    });
    libs._.each(docs.allDocuments, function (api) {
        api.documentUrl = "/doc/api/" + libs.md5(api.name) + ".html";
    });
}
exports.apply = apply;
//# sourceMappingURL=router.js.map