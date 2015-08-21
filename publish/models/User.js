var User = (function () {
    function User(row) {
        this.id = row.ID;
        this.name = row.Name;
        this.emailHead = row.EmailHead;
        this.emailTail = row.EmailTail;
        this.organizationId = row.OrganizationID;
        this.salt = row.Salt;
        this.status = row.Status;
    }
    User.prototype.getEmail = function () {
        return this.emailHead + "@" + this.emailTail;
    };
    return User;
})();
module.exports = User;
//# sourceMappingURL=User.js.map