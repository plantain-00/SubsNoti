import * as services from "../services";
import * as mkdirp from "mkdirp";

mkdirp("images/tmp", (error: Error) => {
    if (error) {
        services.utils.red(error);
    }
});

mkdirp("test_images/tmp", (error: Error) => {
    if (error) {
        services.utils.red(error);
    }
});
