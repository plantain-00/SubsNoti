import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export function getType(status: types.ThemeStatus): types.ThemeStatusType {
    if (status === types.ThemeStatus.open) {
        return types.themeStatus.open;
    }
    if (status === types.ThemeStatus.closed) {
        return types.themeStatus.closed;
    }
    throw libs.util.format(services.error.parameterIsInvalid, "status");
}
