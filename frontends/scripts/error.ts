import * as common from "./common";

$("#message").html(_.escape(decodeURIComponent(common.getUrlParameter("message"))));
