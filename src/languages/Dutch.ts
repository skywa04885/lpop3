import { PopServerConnection } from "../server/PopServerConnection";
import { PopCommandType } from "../shared/PopCommand";
import { PopSessionState } from "../shared/PopSession";
import { Language } from "./Language";

export const Dutch = {
    failure: {
        user: {
            rejected: (user: string, reason: string | null, connection: PopServerConnection) => {
                return `gebruiker geweigerd${reason ? `, reden: ${reason}` : ''}`;
            },
            already_executed: (connection: PopServerConnection) => {
                return `${PopCommandType.User} is al uitgevoerd, volg met ${PopCommandType.Pass}`;
            },
        },
        pass: {
            rejected: (user: string, reason: string | null, connection: PopServerConnection) => {
                return `wachtwoord geweigerd${reason ? `, reden: ${reason}` : ''}`;
            }
        },
        invalid_state: (command_type: PopCommandType, required_state: PopSessionState, connection: PopServerConnection) => {
            return `${command_type} opdracht mag alleen worden uitgevoerd in de ${required_state} staat.`;
        },
        invalid_params: (command_type: PopCommandType, params: number, connection: PopServerConnection) => {
            return `${command_type} vereist ${params > 1 ? 'een' : 'meerdere'} ${params > 1 ? 'argument' : 'argumenten'}, niet meer, niet minder.`;
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
        uidl: {
            no_such_message: (connection: PopServerConnection) => {
                return `bericht bestaat niet, enkel ${connection.session.messages?.length} berichten in de maildrop.`;
            },
        },
    },
    success: {
        greeting: (connection: PopServerConnection) => {
            return `Luke-${connection.pop_sock.secure ? 'POP3S' : 'POP3'} tot uw dienst, ${connection.pop_sock.family} ${connection.pop_sock.address}:${connection.pop_sock.port}.`
        },
        capa: (connection: PopServerConnection) => {
            return `mogelijkheden volgen.`;  
        },
        user: {
            accepted: (user: string, connection: PopServerConnection) => {
                return `gebruiker '${user}' geaccepteerd, volg met ${PopCommandType.Pass}`;
            },
        },
        pass: {
            accepted: (user: string, connection: PopServerConnection) => {
                return `wachtwoord geaccepteerd, welkom '${user}'.`;
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
        language: {
            changing: (lang: string, connection: PopServerConnection) => {
                return `taal wordt veranderd naar '${lang}'.`;
            },
        },
    },
} as Language;
