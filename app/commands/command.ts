import { Auth } from "../auth";

export interface Command {
	run(auth:Auth, options:any): void;
}