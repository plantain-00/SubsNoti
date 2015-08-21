var controllers = require("./controllers/controllers");
exports.allDocuments = [
    controllers.token.generateDocument,
    controllers.token.acceptDocument,
    controllers.token.validateDocument
];
exports.notGetDocuments = [
    controllers.token.generateDocument
];
//# sourceMappingURL=docs.js.map