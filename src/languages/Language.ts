import { PopServerConnection } from "../server/PopServerConnection";
import { PopCommandType } from "../shared/PopCommand";
import { PopSessionState } from "../shared/PopSession";

export enum LanguageName {
    English = 'en',
    Dutch = 'nl',
}

export interface Language {
    failure: {
        user: {
            rejected: (user: string, reason: string | null, connection: PopServerConnection) => string,
            already_executed: (connection: PopServerConnection) => string,
        },
        pass: {
            rejected: (user: string, reason: string | null, connection: PopServerConnection) => string,
        },
        invalid_state: (command_type: PopCommandType, required_state: PopSessionState, connection: PopServerConnection) => string,
        invalid_params: (command_type: PopCommandType, params: number, connection: PopServerConnection) => string,
        execute_command_first: (command_type: PopCommandType, execute_first_command_type: PopCommandType, connection: PopServerConnection) => string,
        command_not_implemented: (command_type: PopCommandType, connection: PopServerConnection) => string,
        language: {
            invalid: (lang: string, connection: PopServerConnection) => string,
        },
        uidl: {
            no_such_message: (connection: PopServerConnection) => string,
        },
        invalid_command: (connection: PopServerConnection) => string,
    },
    success: {
        greeting: (connection: PopServerConnection) => string,
        capa: (connection: PopServerConnection) => string,
        user: {
            accepted: (user: string, connection: PopServerConnection) => string,
        },
        pass: {
            accepted: (user: string, connection: PopServerConnection) => string,
        },
        quit: (connetion: PopServerConnection) => string,
        uidl: {
            all: (connection: PopServerConnection) => string,
        },
        language: {
            changing: (lang: string, connection: PopServerConnection) => string,
        }
    },
}