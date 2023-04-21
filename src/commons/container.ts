import { Container } from "inversify";
import "reflect-metadata";

const container = new Container({ autoBindInjectable: true });

export { container };

export const TYPES={
    aPIDOC:"API_DOC"
};