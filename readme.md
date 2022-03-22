# Luke's POP3 & POP3S Server for NodeJS

## Features

In this case many POP3 / POP3S features have been implemented, including:

1. UIDL
1. TOP
1. USER
1. PASS
1. SASL
1. LANG

Also there are a few languages implemented already:

1. Dutch (nl)
1. English (en)

## Usage

````ts
// Creates the server.
const server = new PopServer({
    get_user: async (user: string, connection: PopServerConnection) => {
        const account: type = await account.fetch(user);
        if (account) {
            connecton.udata.account = account;
            return new PopUser(user, account.password);
        }

        return null;
    },
    receive_messages: async (connection: PopServerConnection): Promise<PopMessage[]> => {
        return await emails.fetch(connection.udata.account);
    },
    delete_messages: async (connection: PopServerConnection, messages: PopMessage[]): Promise<void> => {
        await emails.delete(messages.map(message => message.uid));
    },
    default_language: get_language(LanguageName.Dutch) as Language,
});

// Runs the server.
server.run();
```