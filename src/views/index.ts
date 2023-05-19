import { registerHelp } from "./help";
import { registerResources } from "./resources";

export function registerView() {
    registerHelp();

    registerResources();
}
