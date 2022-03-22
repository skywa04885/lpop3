import net from 'net';
import tls from 'tls';
import { English } from './languages/English';
import { Language, LanguageName } from './languages/Language';
import { get_language } from './languages/LanguageProvider';

import { PopServer } from "./server/PopServer";
import { PopServerConnection } from './server/PopServerConnection';
import { PopMessage } from './shared/PopMessage';
import { PopSocket } from './shared/PopSocket';

const server = new PopServer({
    validate_user: (user: string, u: any) => {
        if (user === 'luke') {
            return true;
        }

        return 'Not luke';
    },
    validate_pass: (pass: string, u: any) => {
        if (pass === 'hello') {
            return true;
        }

        return 'Not hello';
    },
    receive_messages: async (connection: PopServerConnection): Promise<PopMessage[]> => {
        return [];
    },
    delete_messages: async (connection: PopServerConnection, messages: PopMessage[]): Promise<void> => {

    },
    default_language: get_language(LanguageName.Dutch) as Language,
});

server.on('server_error', function (secure: boolean, err: Error | undefined) {
    console.info(`${secure ? 'TLS' : 'Plain'} server had an error: `, err);
});

server.on('server_listening', function (secure: boolean, err: Error | undefined) {
    console.info(`${secure ? 'TLS' : 'Plain'} server is listening!`);
});

server.on('server_close', function (secure: boolean, err: Error | undefined) {
    console.info(`${secure ? 'TLS' : 'Plain'} server has closed!`);
});

server.on('client_connected', function (secure: boolean, socket: PopSocket) {
    console.info(`${secure ? 'TLS' : 'Plain'} client connected: ${socket.socket.remoteAddress}`);
});

server.on('client_disconnected', function (secure: boolean, socket: PopSocket) {
    console.info(`${secure ? 'TLS' : 'Plain'} client disconnected: ${socket.socket.remoteAddress}`);
});

server.run();
