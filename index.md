# Welcome to the LPOP 3 documentation.

## Quick Access

[![npm version](https://badge.fury.io/js/lpop3.svg)](https://badge.fury.io/js/lpop3)

## What is POP3?

POP3 also known as the Post Office Protocol, is a protocol to retreive messages from a mail server, in this case there are no multiple mailboxes as in IMAP, but a single one, since at the time a account was considered a mailbox. This protocol is probably outdated, but can still be used with most of the E-Mail clients, and works just fine for most use cases. The protocol itself is just a text-based protocol (listening on 995 for TLS and 110 for Plain text) and consists of commands and responses, each command followed by a response. In this protocol there are two states in which a session can be, the **AUTHENTICATION** state and the **TRANSACTION** state. In default when you connect you're entering the **AUTHENTICATION** state and you can only execute a small set of commands, none of which are e-mail related, however once you're authenticated you enter the **TRANSACTION** state and you can interact with the emails, and delete / read them.

## Which languages are supported?

1. English (en)
1. Dutch (nl)

If anyone wants to perform translations, create a new Language in the languages directory, and create a pull request after.

## Which POP3 commands are supported?

### *AUTHENTICATION* State.

1. APOP (The APOP authentication command).
1. USER (The command specifying the user, alternative to APOP).
1. PASS (The command specifying the user's password, executed after USER, alternative to APOP).

### *TRANSACTION* State.

1. STAT (Gives the number of messages in the maildrop, and how large they are together).
1. LIST (Lists the messages with their sizes, or a message size if index specified).
1. UIDL (Lists the UID's of all the messages, or the UID of a single message if index specified).
1. TOP (Sends the headers of the message with the given index, and specified N lines after the message headers).
1. DELE (Deletes the message of the given index).
1. RSET (If any messages deleted, don't delete them).
1. RETR (Retreives the message with the given index).

### In any state.

1. QUIT (Terminates the connection, and deletes messages if marked for deletion).
1. CAPA (Lists the capabilities of the server).
1. NOOP (Does nothing!).
1. LANG (Changes the language, or lists all available langauges if no language specified).

## How to use it?

There is a simple PopServer class which you can instantiate with a configuration, in this case the configuration contains some callback functions which are used by the server to for example validate credentials, all the callbacks and options are:

### get_user

```ts
get_user: async (user: string, u: any): Promise<PopPuser | null> => {}
```

The get_user callback is called for user authentication, it is called when either the **USER** Command is executed or the **APOP** Command is executed. The user of this library should here perform the (for example) database call, and return the data in a PopUser instance, which just includes the *user* (username), *pass* (password), *secret* (**APOP** secret) and *udata* (the user data you want), for example:

```ts
get_user: async (user: string, u: any): Promise<PopPuser | null> => {
    const db_user = await DbUser.findOne({ user });
    if (!db_user) {
        return null;
    }

    return new PopUser(db_user.user, db_user.pass, db_user.secret, {
        _id: db_user._id
    });
}
```

### compare_password

```ts
compare_password: (raw: string, hash: string): boolean => {}
```

The compare_password compares the password in the PopUser instance, and the password specified by the **PASS** or **APOP** Command, this is user specified
because there might be usage of BCRYPT or another hash algorithm, for example:

```ts
compare_password: (raw: string, hash: string): boolean => {
    return bcrypt.compareSync(raw, hash); 
}
```

### is_in_use

```ts
is_in_use: async (connection: PopServerConnection): Promise<boolean> => {}
```

the is_in_use callback is used to make sure the same person has no two sessions at the same time, you should (if you want) keep a boolean somewhere in Redis or whatever indicating if a specific user is having a POP3 session
and if so, returning true in this callback will disallow another session to be created.

```ts
is_in_use: async (connection: PopServerConnection) => {
    return connected_users[connection.session.udata.user._id] !== null ? true : false;
},
```

### receive_messages

```ts
receive_messages: async (connection: PopServerConnection): Promise<PopMessage[]> => {}
```

the receive_messages callback gets called once a client is entering the **TRANSACTION** state and needs to fetch emails, this command should return a list of all emails in the database with their unique ID's and sizes,
but not contents! (or it doesn't have to), since you can extend the PopMessage class and override the load_contents function, in which you can load the contents of an email once a user requires it. Example of this callback:

```ts
receive_messages: async (connection: PopServerConnection): Promise<PopMessage[]> => {
    return (await Email.findAll({ use_id: connection.session.udata.user._id })).map((email: Email): PopMessage => {
        return new PopMessage(email._id, email.size, null);
    });
}
```

And an example of the class extension:
```ts
export class DatabasePopMessage extends PopMessage {
    public async load_contents(): Promise<string> {
        return (await Email.findOne({ _id: this.uid })).contents;
    }
}
```

### delete_messages

```ts
delete_messages: async (connection: PopServerConnection, messages: PopMessage[]): Promise<void> => {}
```

The delete_messages callback gets called when an session is ended, and some emails should be deleted, example:

```ts
delete_messages: async (connection: PopServerConnection, messages: PopMessage[]): Promise<void> => {
    messages.forEach((message: PopMessage) => {
        Email.deleteOne({ _id: message.uid }); // No await needed.
    });
}
```


### Default language.

```ts
default_language: Language
```

The default language contains the language in which the POP3 servers operates when a new connection is created, this language will be possible to change during the session, example:


```ts
default_language: get_language(LanguageName.Dutch) as Language
```

### LPOP3 communication example.

```txt
+OK Luke-POP3 tot uw dienst, IPv4 192.168.99.30:64212 <1648112800228@DESKTOP-L07RO3D>
capa
+OK mogelijkheden volgen.
IMPLEMENTATION Luke POP3/POP3S Server, maintainer: luke.rieff@gmail.com
LOGIN-DELAY 0
USER
UIDL
UTF8
EXPIRE NEVER
LANG
.
lang en
+OK changing language to 'en'.
user luke
+OK user 'luke' accepted, proceed with PASS
pass hello
+OK pass accepted, welcome 'luke'.
uidl
+OK mailbox listing follows.
1 0
2 1
3 2
4 3
5 4
6 5
7 6
8 7
9 8
.
retr 9
+OK 206 octets
X-Mailer: My Hands
Subject: Test message
From: test@test.com
Date: Mon, 21 Mar 2022 09:55:42 +0000
To: luke@test.com
Message-ID: <asdadada@awa.com>
Content-Type: text/plain

Hello world!

..
..


.
top 9 0
+OK top follows.
X-Mailer: My Hands
Subject: Test message
From: test@test.com
Date: Mon, 21 Mar 2022 09:55:42 +0000
To: luke@test.com
Message-ID: <asdadada@awa.com>
Content-Type: text/plain
.
dele 9
+OK message 8 deleted.
quit
+OK Luke-POP3 signing off.
```