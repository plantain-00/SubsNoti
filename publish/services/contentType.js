function isNotJson(request) {
    var contentType = request.get('Content-Type');
    return !contentType || contentType.indexOf("application/json") == -1;
}
exports.isNotJson = isNotJson;
//# sourceMappingURL=contentType.js.map