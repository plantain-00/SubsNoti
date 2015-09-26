var libs = require("../../libs");
var services = require("../../services/services");
var documentOfGet = {
    url: "/api/organizations/:organization_id/themes",
    method: "get",
    documentUrl: "/doc/api/Get themes of an organization.html"
};
function get(request, response) {
    var documentUrl = documentOfGet.documentUrl;
    var organizationId = request.body.organizationId;
    if (!organizationId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }
    services.currentUser.get(request, response, documentUrl, function (error, user) {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }
        services.organization.getByMemberId(user.id, function (error, organizations) {
            if (error) {
                services.response.sendDBAccessError(response, error.message, documentUrl);
                return;
            }
            if (libs._.every(organizations, function (o) { return o.id != organizationId; })) {
                services.response.sendUnauthorizedError(response, "can not access the organization", documentUrl);
                return;
            }
            services.theme.getInOrganizationId(organizationId, function (error, themes) {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }
                var result = {
                    themes: libs._.map(themes, function (t) {
                        return {
                            id: t.id,
                            title: t.title,
                            detail: t.detail,
                            organizationId: t.organizationId,
                            createTime: t.createTime.getTime()
                        };
                    })
                };
                services.response.sendOK(response, documentUrl, result);
            });
        });
    });
}
exports.get = get;
function route(app) {
    app[documentOfGet.method](documentOfGet.url, get);
}
exports.route = route;
