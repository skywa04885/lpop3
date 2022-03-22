import { PopServerConnection } from "../server/PopServerConnection";
import { PopCommandType } from "../shared/PopCommand";
import { PopSessionState } from "../shared/PopSession";
import { Language } from "./Language";

export const English = {
    failure: {
        user: {
            rejected: (user: string, reason: string | null, connection: PopServerConnection) => {
                return `user rejected${reason ? `, reason: ${reason}` : ''}`;
            },
            already_executed: (connection: PopServerConnection) => {
                return `${PopCommandType.User} already executed, follow with ${PopCommandType.Pass}`;
            },
        },
        pass: {
            rejected: (user: string, reason: string | null, connection: PopServerConnection) => {
                return `pass rejected${reason ? `, reason: ${reason}` : ''}`;
            }
        },
        invalid_state: (command_type: PopCommandType, required_state: PopSessionState, connection: PopServerConnection) => {
            return `${command_type} command may only be executed in the ${required_state} state.`;
        },
        invalid_params: (command_type: PopCommandType, params: number, connection: PopServerConnection) => {
            return `${command_type} requires ${params> 1 ? 'one' : 'multiple'} ${params > 1 ? 'parameters': 'parameter'}, not more not less.`;
        },
        execute_command_first: (command_type: PopCommandType, execute_first_command_type: PopCommandType, connection: PopServerConnection) => {
            return `command ${execute_first_command_type} must be executed before ${command_type}.`;
        },
        command_not_implemented: (command_type: PopCommandType, connection: PopServerConnection) => {
            return `command ${command_type} is not implemented.`;
        },
        language: {
            invalid: (lang: string, connection: PopServerConnection) => {
                return `invalid language '${lang}'.`;
            },
        },
        invalid_command: (conncetion: PopServerConnection) => {
            return 'invalid command.';
        },
        uidl: {
            no_such_message: (connection: PopServerConnection) => {
                return `no such message, only ${connection.session.messages?.length} messages in maildrop.`;
            },   
        },
    },
    success: {
        greeting: (connection: PopServerConnection) => {
            return `Luke-${connection.pop_sock.secure ? 'POP3S' : 'POP3'} at your service, ${connection.pop_sock.family} ${connection.pop_sock.address}:${connection.pop_sock.port}.`
        },
        capa: (connection: PopServerConnection) => {
            return `capabilities follow.`;  
        },
        user: {
            accepted: (user: string, connection: PopServerConnection) => {
                return `user '${user}' accepted, proceed with ${PopCommandType.Pass}`;
            },
        },
        pass: {
            accepted: (user: string, connection: PopServerConnection) => {
                return `pass accepted, welcome '${user}'.`;
            },
        },
        quit: (connection: PopServerConnection) => {
            return `Luke-${connection.pop_sock.secure ? 'POP3S' : 'POP3'} signing off.`;
        },
        uidl: {
            all: (connection: PopServerConnection) => {
                return 'mailbox listing follows.';
            },
        },
        language: {
            changing: (lang: string, connection: PopServerConnection) => {
                return `changing language to '${lang}'.`;
            },
        },
    },
} as Language;
