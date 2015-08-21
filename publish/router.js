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
    var documentsHome = {
        name: "API document",
        apis: []
    };
    libs._.each(docs.allDocuments, function (api) {
        api.documentUrl = "/doc/api/" + libs.md5(api.name);
        documentsHome.apis.push("<a href='" + api.documentUrl + "'>" + api.name + "</a> -  <a href='" + api.url + "'>" + api.url + "</a> - " + api.method);
        api.url = "<a href='" + api.url + "'>" + api.url + "</a>";
        app.get(api.documentUrl, function (request, response) {
            response.status(200).type('html').send("<style>*{font-family: 'Courier New'}</style><title>" + api.name + "</title><pre style='font-size:16px;'>" + JSON.stringify(api, null, 4) + "<pre>");
        });
    });
    app.get("/api", function (request, response) {
        response.status(200).type('html').send("<style>*{font-family: 'Courier New'}a:link{color:black;text-decoration: none}a:visited {color:black;text-decoration: none}a:hover {color:black;text-decoration: none}a:active {color:black;text-decoration: none}</style><title>" + documentsHome.name + "</title><pre style='font-size:16px;'>" + JSON.stringify(documentsHome, null, 4) + "<pre>");
    });
}
exports.apply = apply;
//# sourceMappingURL=router.js.map