
[![npm version](https://badge.fury.io/js/lpop3.svg)](https://badge.fury.io/js/lpop3)

# Luke's POP3 & POP3S Server for NodeJS

Please go to the documentation bellow for further explainations!

# Quick Links

Documentation: [skywa04885.github.io/lpop3/](https://skywa04885.github.io/lpop3/)

# Usage

````ts
import net from 'net';
import tls from 'tls';
import { DatabasePopMessage, DATABASE_POP_MESSAGE } from 'lpop3/example/DatabasePopMessage';
import { English } from 'lpop3/languages/English';
import { Language, LanguageName } from 'lpop3/languages/Language';
import { get_language } from 'lpop3/languages/LanguageProvider';


import { PopServer } from "lpop3/server/PopServer";
import { PopServerConnection } from 'lpop3/server/PopServerConnection';
import { PopMessage } from 'lpop3/shared/PopMessage';
import { PopSocket } from 'lpop3/shared/PopSocket';
import { PopUser } from 'lpop3/shared/PopUser';
import { PopServerConfig } from 'lpop3/server/PopServerConfig';
import { Dutch } from 'lpop3/languages/Dutch';

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

async function get_user(user: string, _: PopServerConnection): Promise<PopUser | null> {
    return new PopUser(user, 'asd');
}

async function is_in_use(_: PopServerConnection): Promise<boolean> {
    return false;
}

function compare_password(password: string, hash:string): boolean {
    return password === hash;
}

async function receive_messages(_: PopServerConnection): Promise<PopMessage[]> {
    return database;
}

async function delete_messages(_: PopServerConnection, messages: PopMessage[]): Promise<void> {
    messages.forEach((message: PopMessage): void => {
        const index: number = database.findIndex(a => a.uid === message.uid);
        if (!index) {
            return;
        }

        database.splice(index, 1);
    });
}

const config: PopServerConfig = new PopServerConfig(get_user, is_in_use, compare_password, receive_messages, delete_messages, Dutch);
const server: PopServer = new PopServer(config);

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