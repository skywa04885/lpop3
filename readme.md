
[![npm version](https://badge.fury.io/js/lpop3.svg)](https://badge.fury.io/js/lpop3)

# Luke's POP3 & POP3S Server for NodeJS

## For people who had issues.

I'm sorry I was not aware my package could not be imported properly.

## Features

In this case many POP3 / POP3S features have been implemented, including:

1. UIDL
1. TOP
1. USER
1. PASS
1. LANG
1. APOP

Also there are a few languages implemented already:

1. Dutch (nl)
1. English (en)

## Usage

````ts
import { PopServer } from 'lpop3/dist/server/PopServer'
import { PopUser } from 'lpop3/dist/shared/PopUser';
import { DatabasePopMessage, DATABASE_POP_MESSAGE } from 'lpop3/dist/example/DatabasePopMessage'
import { PopServerConnection } from 'lpop3/dist/server/PopServerConnection';
import { PopMessage } from 'lpop3/dist/shared/PopMessage';
import { get_language } from 'lpop3/dist/languages/LanguageProvider';
import { Language, LanguageName } from 'lpop3/dist/languages/Language';
import { PopSocket } from 'lpop3/dist/shared/PopSocket';

let database: DatabasePopMessage[] = [
    new DatabasePopMessage(0, DATABASE_POP_MESSAGE.length, DATABASE_POP_MESSAGE),
    new DatabasePopMessage(1, DATABASE_POP_MESSAGE.length, DATABASE_POP_MESSAGE),
    new DatabasePopMessage(2, DATABASE_POP_MESSAGE.length, DATABASE_POP_MESSAGE),
    new DatabasePopMessage(3, DATABASE_POP_MESSAGE.length, DATABASE_POP_MESSAGE),
    new DatabasePopMessage(4, DATABASE_POP_MESSAGE.length, DATABASE_POP_MESSAGE),
    new DatabasePopMessage(5, DATABASE_POP_MESSAGE.length, DATABASE_POP_MESSAGE),
    new DatabasePopMessage(6, DATABASE_POP_MESSAGE.length, DATABASE_POP_MESSAGE),
    new DatabasePopMessage(7, DATABASE_POP_MESSAGE.length, DATABASE_POP_MESSAGE),
    new DatabasePopMessage(8, DATABASE_POP_MESSAGE.length, DATABASE_POP_MESSAGE),
];

const server = new PopServer({
    get_user: async (user: string, u: any) => {
        if (user === 'luke') {
            return new PopUser('luke', 'hello');
        }

        return null;
    },
    compare_password: (raw: string, hash: string) => {
        return raw === hash;
    },
    is_in_use: async (connection: PopServerConnection) => {
        return false;
    },
    receive_messages: async (connection: PopServerConnection): Promise<PopMessage[]> => {
        return database;
    },
    delete_messages: async (connection: PopServerConnection, messages: PopMessage[]): Promise<void> => {
        messages.forEach(message => {
            database.splice(database.findIndex(a => (a.uid === message.uid)), 1);
        });
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
```