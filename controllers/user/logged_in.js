var libs = require("../../libs");
var settings = require("../../settings");
var services = require("../../services/services");
var documentOfGet = {
    url: settings.config.urls.login,
    method: "get",
    documentUrl: "/doc/api/Log in.html"
};
function get(request, response) {
    var authenticationCredential = request.query.authentication_credential;
    if (!authenticationCredential) {
        response.redirect("/index.html");
        return;
    }
    response.cookie(services.cookieKey.authenticationCredential, authenticationCredential, {
        expires: libs.moment().clone().add(1, "months").toDate(),
        httpOnly: true
    });
    response.redirect("/index.html?clear_previous_status=√");
}
exports.get = get;
var documentOfDelete = {
    url: "/api/user/logged_in",
    method: "delete",
    documentUrl: "/doc/api/Log out.html"
};
function deleteThis(request, response) {
    var documentUrl = documentOfDelete.documentUrl;
    response.clearCookie(services.cookieKey.authenticationCredential);
    services.response.sendOK(response, documentUrl);
}
exports.deleteThis = deleteThis;
function route(app) {
    app[documentOfDelete.method](documentOfDelete.url, deleteThis);
    app[documentOfGet.method](documentOfGet.url, get);
}
exports.route = route;
