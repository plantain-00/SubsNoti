declare
var $;

export function authenticate(next:(error:Error, data:any)=>void) {
    $.ajax({
        url: "/api/current_user.json",
        data: {},
        cache: false,
        success: function (data) {
            if (data.isSuccess) {
                $("#currentUserName").html(data.name);
                next(null, data);
            } else {
                next(new Error(data.error_message), null);
            }
        }
    });
}