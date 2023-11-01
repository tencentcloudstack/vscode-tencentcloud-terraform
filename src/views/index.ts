import { registerHelp } from "./help";
import { registerLogin } from "./login";
import { registerResources } from "./resources";

export function registerView() {
    registerHelp();
    registerResources();
    registerLogin();
}
