import { Language } from "../languages/Language";
import { PopMessage } from "../shared/PopMessage";
import { PopServer } from "./PopServer";
import { PopServerConnection } from "./PopServerConnection";

export interface PopServerConfig {
    validate_user: (user: string, connection: PopServerConnection) => boolean | string,
    validate_pass: (pass: string, connection: PopServerConnection) => boolean | string,
    receive_messages: (connection: PopServerConnection) => Promise<PopMessage[]>,
    delete_messages: (connection: PopServerConnection, messages: PopMessage[]) => Promise<void>,
    default_language: Language
}
