import { PopServerConnection } from "../server/PopServerConnection";
import { PopCommandType } from "../shared/PopCommand";
import { PopMessage } from "../shared/PopMessage";
import { PopSessionState } from "../shared/PopSession";

export enum LanguageName {
    English = 'en',
    Dutch = 'nl',
}

export interface Language {
    failure: {
        user: {
            rejected: (connection: PopServerConnection) => string,
            already_executed: (connection: PopServerConnection) => string,
        },
        pass: {
            rejected: (connection: PopServerConnection) => string,
        },
        invalid_state: (command_type: PopCommandType, required_state: PopSessionState, connection: PopServerConnection) => string,
        invalid_params: (command_type: PopCommandType, params: number, connection: PopServerConnection) => string,
        execute_command_first: (command_type: PopCommandType, execute_first_command_type: PopCommandType, connection: PopServerConnection) => string,
        command_not_implemented: (command_type: PopCommandType, connection: PopServerConnection) => string,
        language: {
            invalid: (lang: string, connection: PopServerConnection) => string,
        },
        dele: {
            already_deleted: (index: number, connection: PopServerConnection) => string,
        },
        no_such_message: (connection: PopServerConnection) => string,
        message_deleted: (index: number, connection: PopServerConnection) => string,
        invalid_command: (connection: PopServerConnection) => string,
        permission_denied: (connection: PopServerConnection) => string,
        in_use: (connection: PopServerConnection) => string,
    },
    success: {
        greeting: (connection: PopServerConnection) => string,
        capa: (connection: PopServerConnection) => string,
        user: {
            accepted: (connection: PopServerConnection) => string,
        },
        pass: {
            accepted: (connection: PopServerConnection) => string,
        },
        quit: (connetion: PopServerConnection) => string,
        uidl: {
            all: (connection: PopServerConnection) => string,
        },
        retr: (message: PopMessage, connection: PopServerConnection) => string,
        list: (connection: PopServerConnection) => string,
        rset: (connection: PopServerConnection) => string,
        dele: {
            deleted: (index: number, connection: PopServerConnection) => string,
        },
        language: {
            changing: (lang: string, connection: PopServerConnection) => string,
            list: (connection: PopServerConnection) => string,
        },
        apop: {
            logged_in: (connection: PopServerConnection) => string,
        },
        top: {
            base: (connection: PopServerConnection) => string,
        },
    },
}