import { Language } from "../languages/Language";
import { PopMessage } from "../shared/PopMessage";
import { PopUser } from "../shared/PopUser";
import { PopServer } from "./PopServer";
import { PopServerConnection } from "./PopServerConnection";

export interface PopServerConfig {
    get_user: (user: string, connection: PopServerConnection) => Promise<PopUser | null>,
    is_in_use: (connection: PopServerConnection) => Promise<boolean>,
    compare_password: (raw: string, hash: string) => boolean,
    receive_messages: (connection: PopServerConnection) => Promise<PopMessage[]>,
    delete_messages: (connection: PopServerConnection, messages: PopMessage[]) => Promise<void>,
    default_language: Language
}
