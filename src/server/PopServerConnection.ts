import { EventEmitter } from "stream";
import { Language, LanguageName } from "../languages/Language";
import { get_language } from "../languages/LanguageProvider";
import { ApopDigest } from "../shared/ApopDigest";
import { CAPABILITIES, LINE_SEPARATOR } from "../shared/Constants";
import { PopBanner } from "../shared/PopBanner";
import { PopCommand, PopCommandType } from "../shared/PopCommand";
import { PopMessage, PopMessageFlag } from "../shared/PopMessage";
import { PopMultilineResponse } from "../shared/PopMultilineResponse";
import { PopResponse, PopResponseType } from "../shared/PopResponse";
import { PopSegmentedReader } from "../shared/PopSegmentedReader";
import { PopSessionState } from "../shared/PopSession";
import { PopSocket } from "../shared/PopSocket";
import { PopUser } from "../shared/PopUser";
import { PopServer } from "./PopServer";
import { PopServerSession } from "./PopServerSession";

export class PopServerConnection extends EventEmitter {
    protected segmented_reader: PopSegmentedReader;
    public udata: any;

    /**
     * Constructs a new PopServerConnection.
     * @param pop_sock the socket.
     */
    public constructor(public readonly server: PopServer, public readonly pop_sock: PopSocket, public readonly session: PopServerSession) {
        super();

        this.segmented_reader = new PopSegmentedReader();
    }

    /**
     * Begins the server connection (listens and sends initial line).
     * @returns ourselves.
     */
    public begin(): PopServerConnection {
        this.pop_sock.on('close', (had_error: boolean) => this._event_close(had_error));
        this.pop_sock.on('data', (data: Buffer) => this._event_data(data));

        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            [this.session.language.success.greeting(this), this.session.banner.encode()]).encode(true));

        return this;
    }

    /**
     * Gets called when the socket closed.
     * @param had_error if there was an error (net-only).
     */
    protected _event_close(had_error: boolean): void {
    }

    /**
     * Gets called when there is data available.
     * @param data the data.
     */
    protected async _event_data(data: Buffer): Promise<void> {
        this.segmented_reader.write(data.toString('utf-8'));
        for (const line of this.segmented_reader.lines()) {
            await this._handle_line(line);
        }
    }

    /**
     * Handles a single line.
     * @param line the line available for reading.
     */
    protected async _handle_line(line: string): Promise<void> {
        try {
            const command: PopCommand = PopCommand.decode(line);

            switch (command.type) {
                case PopCommandType.Capa:
                    this._handle_capa();
                    break;
                case PopCommandType.Quit:
                    await this._handle_quit();
                    break;
                case PopCommandType.Lang:
                    this._handle_lang(command);
                    break;
                case PopCommandType.User:
                    await this._handle_user(command);
                    break;
                case PopCommandType.Pass:
                    await this._handle_pass(command);
                    break;
                case PopCommandType.Stat:
                    this._handle_stat();
                    break;
                case PopCommandType.Uidl:
                    this._handle_uidl(command);
                    break;
                case PopCommandType.Retr:
                    await this._handle_retr(command);
                    break;
                case PopCommandType.List:
                    await this._handle_list(command);
                    break;
                case PopCommandType.Noop:
                    await this._handle_noop();
                    break;
                case PopCommandType.Rset:
                    await this._handle_rset();
                    break;
                case PopCommandType.Dele:
                    await this._handle_dele(command);
                    break;
                case PopCommandType.Apop:
                    await this._handle_apop(command);
                    break;
                default:
                    this._handle_not_implemented(command);
                    break;
            }
        } catch (e) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_command(this)).encode(true));
            return;
        }
    }

    /**
     * Handles the QUIT command.
     */
    protected async _handle_quit(): Promise<void> {
        // Deletes all the messages.
        await this.server.config.delete_messages(this, this.session.messages?.filter(function (message) {
            return (message.flags & PopMessageFlag.Delete) !== 0;
        }) ?? []);

        // Writes the response.
        this.pop_sock.write(new PopResponse(PopResponseType.Success, this.session.language.success.quit(this)).encode(true));
        this.pop_sock.close();
    }

    /**
     * Handles the NOOP command.
     */
    protected _handle_noop(): void {
        this.pop_sock.write(new PopResponse(PopResponseType.Success, null).encode(true));
    }

    /**
     * Handles the capability command.
     */
    protected _handle_capa(): void {
        this.pop_sock.write(new PopResponse(PopResponseType.Success, this.session.language.success.capa(this)).encode(true));
        for (const capability of CAPABILITIES) {
            PopMultilineResponse.write_line(capability.encode(), this.pop_sock);
        }
        PopMultilineResponse.write_end(this.pop_sock);
    }

    /**
     * Handles the APOP command.
     * @param command the command.
     */
    protected async _handle_apop(command: PopCommand): Promise<void> {
        // Makes sure we're in the correct state.
        if (this.session.state !== PopSessionState.Authorization) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_state(PopCommandType.Apop,
                    PopSessionState.Authorization, this)).encode(true));
            return;
        }

        // Makes sure there are two arguments.
        if (!command.arguments || command.arguments.length != 2) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_params(PopCommandType.User, 2, this)).encode(true));
            return;
        }

        // Gets the arguments.
        const args: string[] = command.arguments;
        const user: string = args[0];
        const digest: string = args[1];

        // Makes sure the user exists.
        const result: PopUser | null = await this.server.config.get_user(user, this);
        if (result === null) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.permission_denied(this)).encode(true));
            return;
        }

        // Sets the user.
        this.session.user = result;

        // Checks the digest.
        const generated_digest: string = ApopDigest.generate(this.session.banner, this.session.user.pass);
        if (generated_digest !== digest) {
            this.session.user = null;
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.permission_denied(this)).encode(true));
            return;
        }

        // Updates the session.
        this.session.state = PopSessionState.Transaction;

        // Loads the messages.
        this.session.messages = await this.server.config.receive_messages(this);

        // Sends the success message.
        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            this.session.language.success.apop.logged_in(this)).encode(true));
    }

    /**
     * Handles the RSET command.
     */
    protected _handle_rset(): void {
        // Removes the delete flags from each message.
        this.session.messages?.forEach(message => {
            message.flags &= ~(PopMessageFlag.Delete);
        });

        // Sends the success.
        this.pop_sock.write(new PopResponse(PopResponseType.Success, 
            this.session.language.success.rset(this)).encode(true));
    }

    /**
     * Handles the LIST command.
     * @param command the command.
     */
    protected _handle_list(command: PopCommand): void {
        // Makes sure we're in transaction state.
        if (this.session.state !== PopSessionState.Transaction) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_state(PopCommandType.Stat,
                    PopSessionState.Transaction, this)).encode(true));
            return;
        }

        // Makes sure there are any messages in the first place.
        if (!this.session.messages) {
            throw new Error('Session has not loaded messages yet.');
        }

        // Checks if we have an argument, if so we need to fetch a specific one.
        if (command.arguments) {
            // If there are arguments but not the correct amount, throw an error.
            if (command.arguments.length !== 1) {
                this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                    this.session.language.failure.invalid_params(PopCommandType.List, 1, this)).encode(true));
                return;
            }

            // Gets the index and subtracts one, and if the message does not exist
            //  send an error.
            const index: number = parseInt(command.arguments[0]) - 1;
            if (index < 0 || index >= this.session.messages.length) {
                this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                    this.session.language.failure.no_such_message(this)).encode(true));
                return;
            }

            // Sends the UID for the given message.
            this.pop_sock.write(new PopResponse(PopResponseType.Success,
                [(index + 1).toString(), this.session.messages[index].size.toString()]).encode(true));
            return;
        }

        // Writes the success mesasge.
        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            this.session.language.success.list(this)).encode(true));

        // Writes the list of all message sizes.
        this.session.messages.forEach((message: PopMessage, index: number) => {
            PopMultilineResponse.write_line([(index + 1).toString(), message.size.toString()], this.pop_sock);
        });
        PopMultilineResponse.write_end(this.pop_sock);
    }
    
    /**
     * Handles the DELE command.
     * @param command the command.
     */
    protected _handle_dele(command: PopCommand): void {
        // Makes sure we're in the transaction state.
        if (this.session.state !== PopSessionState.Transaction) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_state(PopCommandType.Dele,
                    PopSessionState.Transaction, this)).encode(true));
            return;
        }

        // Makes sure there are messages at all.
        if (!this.session.messages) {
            throw new Error('Session has not loaded messages yet.');
        }

        // Makes sure there is a argument at all.
        if (!command.arguments || command.arguments.length != 1) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_params(PopCommandType.Pass, 1, this)).encode(true));
            return;
        }

        // Gets the index and subtracts one, and if the message does not exist
        //  send an error.
        const index: number = parseInt(command.arguments[0]) - 1;
        if (index < 0 || index >= this.session.messages.length) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.no_such_message(this)).encode(true));
            return;
        }

        // Gets the message.
        let message: PopMessage = this.session.messages[index];

        // Checks if the message is marked for deletion already.
        if ((message.flags & PopMessageFlag.Delete) !== 0) {
            this.pop_sock.write(new PopResponse(PopResponseType.Success,
                this.session.language.failure.dele.already_deleted(index, this)).encode(true));
            return;
        }

        // Marks the message for deletion.
        message.flags |= PopMessageFlag.Delete;

        // Sends the success.
        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            this.session.language.success.dele.deleted(index, this)).encode(true));
    }

    /**
     * Handles the RETR command.
     * @param command the command.
     */
    protected async _handle_retr(command: PopCommand): Promise<void> {
        // Makes sure we're in the transaction state.
        if (this.session.state !== PopSessionState.Transaction) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_state(PopCommandType.Retr,
                    PopSessionState.Transaction, this)).encode(true));
            return;
        }

        // Makes sure there are messages at all.
        if (!this.session.messages) {
            throw new Error('Session has not loaded messages yet.');
        }

        // Makes sure there is a argument at all.
        if (!command.arguments || command.arguments.length != 1) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_params(PopCommandType.Pass, 1, this)).encode(true));
            return;
        }

        // Gets the index and subtracts one, and if the message does not exist
        //  send an error.
        const index: number = parseInt(command.arguments[0]) - 1;
        if (index < 0 || index >= this.session.messages.length) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.no_such_message(this)).encode(true));
            return;
        }

        // Gets the message content.
        const message: PopMessage = this.session.messages[index];
        const content: string = await message.contents();

        // Splits the message content into lines (this is required to filter for dots.);
        const splitted_content: string[] = content.split(LINE_SEPARATOR);

        // Sends the success response.
        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            this.session.language.success.retr(message, this)).encode(true));

        // Sends the lines.
        for (const line of splitted_content) {
            PopMultilineResponse.write_line(line, this.pop_sock);
        }
        PopMultilineResponse.write_end(this.pop_sock);
    }

    /**
     * Handles the STAT command.
     */
    protected _handle_stat(): void {
        // Makes sure we're in the transaction state.
        if (this.session.state !== PopSessionState.Transaction) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_state(PopCommandType.Stat,
                    PopSessionState.Transaction, this)).encode(true));
            return;
        }

        // Makes sure there are messages at all.
        if (!this.session.messages) {
            throw new Error('Session has not loaded messages yet.');
        }


        // Writes the status response.
        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            [this.session.messages.length.toString(), this.session.messages_size_sum.toString()]).encode(true));
    }

    /**
     * Handles the UIDL command.
     */
    protected _handle_uidl(command: PopCommand): void {
        // Makes sure we're in transaction state.
        if (this.session.state !== PopSessionState.Transaction) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_state(PopCommandType.Uidl,
                    PopSessionState.Transaction, this)).encode(true));
            return;
        }

        // Makes sure there are any messages in the first place.
        if (!this.session.messages) {
            throw new Error('Session has not loaded messages yet.');
        }

        // Checks if we have an argument, if so we need to fetch a specific one.
        if (command.arguments) {
            // If there are arguments but not the correct amount, throw an error.
            if (command.arguments.length !== 1) {
                this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                    this.session.language.failure.invalid_params(PopCommandType.Uidl, 1, this)).encode(true));
                return;
            }

            // Gets the index and subtracts one, and if the message does not exist
            //  send an error.
            const index: number = parseInt(command.arguments[0]) - 1;
            if (index < 0 || index >= this.session.messages.length) {
                this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                    this.session.language.failure.no_such_message(this)).encode(true));
                return;
            }

            // Sends the UID for the given message.
            this.pop_sock.write(new PopResponse(PopResponseType.Success,
                [(index + 1).toString(), this.session.messages[index].uid_string]).encode(true));
            return;
        }

        // Writes the success mesasge.
        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            this.session.language.success.uidl.all(this)).encode(true));

        // Writes the list of all message ID's.
        this.session.messages.forEach((message: PopMessage, index: number) => {
            PopMultilineResponse.write_line([(index + 1).toString(), message.uid_string], this.pop_sock);
        });
        PopMultilineResponse.write_end(this.pop_sock);
    }

    /**
     * Handles the lang command.
     * @param command the command.
     */
    protected _handle_lang(command: PopCommand): void {
        if (!command.arguments) {

            this.pop_sock.write(new PopResponse(PopResponseType.Success, this.session.language.success.capa(this)).encode(true));

            for (const [key, value] of Object.entries(LanguageName)) {
                PopMultilineResponse.write_line(`${value} ${key}`, this.pop_sock);
            }
            PopMultilineResponse.write_end(this.pop_sock);
            return;
        }

        if (command.arguments.length != 1) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_params(PopCommandType.Lang, 1, this)).encode(true));
            return;
        }

        const lang: string = command.arguments[0];
        if (!Object.values(LanguageName).includes(lang as LanguageName)) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.language.invalid(lang, this)).encode(true));
            return;
        }

        this.session.language = get_language(lang as LanguageName) as Language;
        this.pop_sock.write(new PopResponse(PopResponseType.Failure,
            this.session.language.success.language.changing(lang, this)).encode(true));
    }

    /**
     * Handles the user command.
     * @param command the command.
     */
    protected async _handle_user(command: PopCommand): Promise<void> {
        if (this.session.state !== PopSessionState.Authorization) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_state(PopCommandType.User,
                    PopSessionState.Authorization, this)).encode(true));
            return;
        }

        if (this.session.user) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.user.already_executed(this)).encode(true));
            return;
        }

        if (!command.arguments || command.arguments.length != 1) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_params(PopCommandType.User, 1, this)).encode(true));
            return;
        }

        const user: string = command.arguments[0];
        const result: PopUser | null = await this.server.config.get_user(user, this);

        if (result === null) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.user.rejected(this)).encode(true));
            return;
        }

        this.session.user = result;
        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            this.session.language.success.user.accepted(this)).encode(true));
    }

    /**
     * Handles the pass command.
     * @param command the command.
     */
    protected async _handle_pass(command: PopCommand): Promise<void> {
        if (this.session.state !== PopSessionState.Authorization) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_state(PopCommandType.Pass, PopSessionState.Authorization, this)).encode(true));
            return;
        }

        if (!this.session.user) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.execute_command_first(PopCommandType.Pass, PopCommandType.User, this)).encode(true));
            return;
        }

        if (!command.arguments || command.arguments.length != 1) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.invalid_params(PopCommandType.Pass, 1, this)).encode(true));
            return;
        }

        const pass: string = command.arguments[0];

        if (pass !== this.session.user.pass) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.pass.rejected(this)).encode(true));
            return;
        }

        this.session.state = PopSessionState.Transaction;
        this.session.messages = await this.server.config.receive_messages(this);

        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            this.session.language.success.pass.accepted(this)).encode(true));
    }

    /**
     * Gets called when a command is not implemented.
     * 
     * @param command the command.
     */
    protected _handle_not_implemented(command: PopCommand): void {
        this.pop_sock.write(new PopResponse(PopResponseType.Failure,
            this.session.language.failure.command_not_implemented(command.type, this)).encode(true));
    }
}