import { PopServerConnection } from "../server/PopServerConnection";
import { PopCommandType } from "../shared/PopCommand";
import { PopMessage } from "../shared/PopMessage";
import { PopSessionState } from "../shared/PopSession";
import { Language } from "./Language";

export const Dutch = {
    failure: {
        user: {
            rejected: (connection: PopServerConnection) => {
                return `gebruiker geweigerd`;
            },
            already_executed: (connection: PopServerConnection) => {
                return `${PopCommandType.User} is al uitgevoerd, volg met ${PopCommandType.Pass}`;
            },
        },
        pass: {
            rejected: (connection: PopServerConnection) => {
                return `wachtwoord geweigerd`;
            }
        },
        invalid_state: (command_type: PopCommandType, required_state: PopSessionState, connection: PopServerConnection) => {
            return `${command_type} opdracht mag alleen worden uitgevoerd in de ${required_state} staat.`;
        },
        invalid_params: (command_type: PopCommandType, params: number, connection: PopServerConnection) => {
            return `${command_type} vereist ${params === 1 ? 'een' : 'meerdere'} ${params === 1 ? 'argument' : 'argumenten'}, niet meer, niet minder.`;
        },
        execute_command_first: (command_type: PopCommandType, execute_first_command_type: PopCommandType, connection: PopServerConnection) => {
            return `opdracht ${execute_first_command_type} moet uitgevoerd worden voor ${command_type}.`;
        },
        command_not_implemented: (command_type: PopCommandType, connection: PopServerConnection) => {
            return `opdracht ${command_type} is niet geïmplementeerd.`;
        },
        language: {
            invalid: (lang: string, connection: PopServerConnection) => {
                return `ongeldige taal '${lang}'.`;
            },
        },
        invalid_command: (conncetion: PopServerConnection) => {
            return 'Ongeldige opdracht.';
        },
        dele: {
            already_deleted: (index: number, connection: PopServerConnection) => {
                return `bericht ${index} is al verwijderd.`;
            },
        },
        no_such_message: (connection: PopServerConnection) => {
            return `bericht bestaat niet, enkel ${connection.session.messages?.length} berichten in de maildrop.`;
        },
        permission_denied: (connection: PopServerConnection) => {
            return `toegang geweigerd.`;
        },
    },
    success: {
        retr: (message: PopMessage, connection: PopServerConnection) => {
            return `${message.size} bytes`;
        },
        greeting: (connection: PopServerConnection) => {
            return `Luke-${connection.pop_sock.secure ? 'POP3S' : 'POP3'} tot uw dienst, ${connection.pop_sock.family} ${connection.pop_sock.address}:${connection.pop_sock.port}`
        },
        capa: (connection: PopServerConnection) => {
            return `mogelijkheden volgen.`;  
        },
        user: {
            accepted: (connection: PopServerConnection) => {
                return `gebruiker '${connection.session.user?.user}' geaccepteerd, volg met ${PopCommandType.Pass}`;
            },
        },
        pass: {
            accepted: (connection: PopServerConnection) => {
                return `wachtwoord geaccepteerd, welkom '${connection.session.user?.user}'.`;
            },
        },
        quit: (connection: PopServerConnection) => {
            return `Luke-${connection.pop_sock.secure ? 'POP3S' : 'POP3'} meld zich af.`;
        },
        uidl: {
            all: (connection: PopServerConnection) => {
                return 'de lijst van berichten volgt.';
            },
        },
        list: (connection: PopServerConnection) => {
            return `${connection.session.messages?.length} (${connection.session.messages_size_sum} bytes)`;
        },
        rset: (connection: PopServerConnection) => {
            return `maildrop heeft ${connection.session.messages?.length} berichten (${connection.session.messages_size_sum} bytes).`;
        },
        dele: {
            deleted: (index: number, connection: PopServerConnection) => {
                return `bericht ${index} is verwijderd.`;
            },
        },
        language: {
            changing: (lang: string, connection: PopServerConnection) => {
                return `taal wordt veranderd naar '${lang}'.`;
            },
        },
        apop: {
            logged_in: (connection: PopServerConnection) => {
                return `maildrop heeft ${connection.session.messages?.length} berichten (${connection.session.messages_size_sum} bytes)`;
            },
        },
    },
} as Language;
