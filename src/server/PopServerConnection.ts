import { EventEmitter } from "stream";
import { Language, LanguageName } from "../languages/Language";
import { get_language } from "../languages/LanguageProvider";
import { CAPABILITIES } from "../shared/Constants";
import { PopCommand, PopCommandType } from "../shared/PopCommand";
import { PopMessage } from "../shared/PopMessage";
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
            this.session.language.success.greeting(this)).encode(true));

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
                    this._handle_quit();
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
     * Handles the quit command.
     */
    protected _handle_quit(): void {
        this.pop_sock.write(new PopResponse(PopResponseType.Success, this.session.language.success.quit(this)).encode(true));
        this.pop_sock.close();
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

        // Sums all the lengths of the messages.
        let total_size: number = 0;
        this.session.messages.forEach((message: PopMessage) => {
            total_size += message.size;
        });

        // Writes the status response.
        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            [this.session.messages.length.toString(), total_size.toString()]).encode(true));
    }

    /**
     * Handles the UIDL command.
     */
    protected _handle_uidl(command: PopCommand): void {
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
                    this.session.language.failure.invalid_params(PopCommandType.Uidl, 1, this)).encode(true));
                return;
            }

            // Gets the index and subtracts one, and if the message does not exist
            //  send an error.
            const index: number = parseInt(command.arguments[0]) - 1;
            if (index < 0 || index >= this.session.messages.length) {
                this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                    this.session.language.failure.uidl.no_such_message(this)).encode(true));
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
        const result: boolean | string = await this.server.config.validate_user(user, this);

        if (result !== true) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.user.rejected(user, result === false ? null : result, this)).encode(true));
            return;
        }

        this.session.user = new PopUser(user, null);
        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            this.session.language.success.user.accepted(user, this)).encode(true));
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
        const user: string = this.session.user.user as string;
        const result: boolean | string = await this.server.config.validate_pass(pass, this);

        if (result !== true) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure,
                this.session.language.failure.pass.rejected(user, result === false ? null : result, this)).encode(true));
            return;
        }

        this.session.user.pass = pass;
        this.session.state = PopSessionState.Transaction;

        this.session.messages = await this.server.config.receive_messages(this);

        this.pop_sock.write(new PopResponse(PopResponseType.Success,
            this.session.language.success.pass.accepted(user, this)).encode(true));
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