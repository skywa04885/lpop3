import { TLSSocketOptions } from "tls";
import { Language } from "../languages/Language";
import { PopMessage } from "../shared/PopMessage";
import { PopUser } from "../shared/PopUser";
import { PopServer } from "./PopServer";
import { PopServerConnection } from "./PopServerConnection";

export class PopServerConfig {
    public constructor(
        public readonly get_user: (user: string, connection: PopServerConnection) => Promise<PopUser | null>,
        public readonly is_in_use: (connection: PopServerConnection) => Promise<boolean>,
        public readonly compare_password: (raw: string, hash: string) => Promise<boolean>,
        public readonly receive_messages: (connection: PopServerConnection) => Promise<PopMessage[]>,
        public readonly delete_messages: (connection: PopServerConnection, messages: PopMessage[]) => Promise<void>,
        public readonly default_language: Language
    ) { }
}
