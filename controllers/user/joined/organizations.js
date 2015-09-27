var libs = require("../../../libs");
var services = require("../../../services/services");
var documentOfGet = {
    url: "/api/user/joined/organizations",
    method: "get",
    documentUrl: "/doc/api/Get joined organizations.html"
};
function get(request, response) {
    var documentUrl = documentOfGet.documentUrl;
    services.currentUser.get(request, response, documentUrl).then(function (user) {
        return services.organization.getByMemberId(user.id).then(function (organizations) {
            var result = {
                organizations: libs._.map(organizations, function (o) {
                    return {
                        id: o.id,
                        name: o.name
                    };
                })
            };
            services.response.sendOK(response, documentUrl, result);
        }).catch(function (error) {
            services.response.sendDBAccessError(response, error.message, documentUrl);
        });
    }, function (error) {
        services.response.sendUnauthorizedError(response, error.message, documentUrl);
    }).done();
}
exports.get = get;
function route(app) {
    app[documentOfGet.method](documentOfGet.url, get);
}
exports.route = route;
