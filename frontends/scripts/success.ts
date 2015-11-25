import * as common from "./common";

let willClearPreviousStatus = common.getUrlParameter("clear_previous_status");

if (willClearPreviousStatus === "√") {
    window.sessionStorage.removeItem(common.sessionStorageNames.loginResult);
}
