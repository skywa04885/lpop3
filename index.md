# Welcome to the LPOP 3 documentation.

## What is POP3?

POP3 also known as the Post Office Protocol, is a protocol to retreive messages from a mail server, in this case there are no multiple mailboxes as in IMAP, but a single one, since at the time a account was considered a mailbox. This protocol is probably outdated, but can still be used with most of the E-Mail clients, and works just fine for most use cases. The protocol itself is just a text-based protocol (listening on 995 for TLS and 110 for Plain text) and consists of commands and responses, each command followed by a response. In this protocol there are two states in which a session can be, the *AUTHENTICATION* state and the *TRANSACTION* state. In default when you connect you're entering the *AUTHENTICATION* state and you can only execute a small set of commands, none of which are e-mail related, however once you're authenticated you enter the *TRANSACTION* state and you can interact with the emails, and delete / read them.

## 
