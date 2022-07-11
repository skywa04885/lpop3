/*
    Copyright 2022 Luke A.C.A. Rieff (Skywa04885)

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import {EventEmitter} from "stream";
import {Language, LanguageName} from "../languages/Language";
import {getLanguage} from "../languages/LanguageProvider";
import {ApopDigest} from "../shared/ApopDigest";
import {CAPABILITIES, LINE_SEPARATOR, MAX_INVALID_COMMANDS,} from "../shared/Constants";
import {PopCommand, PopCommandType} from "../shared/PopCommand";
import {PopMessage, PopMessageFlag} from "../shared/PopMessage";
import {PopMultilineResponse} from "../shared/PopMultilineResponse";
import {PopResponse, PopResponseType} from "../shared/PopResponse";
import {PopSessionState} from "../shared/PopSession";
import {PopSocket} from "../shared/PopSocket";
import {PopUser} from "../shared/PopUser";
import {PopServer} from "./PopServer";
import {PopServerSession} from "./PopServerSession";
import {PopExtRespCode} from "../shared/PopExtRespCode";
import {PopServerStream} from "./PopServerStream";
import {EmailAddress} from "llibemailaddress";
import {PopError, PopInvalidCommandError} from "../shared/PopError";

export class PopServerConnection extends EventEmitter {
  public udata: any;
  protected stream: PopServerStream;

  /**
   * Constructs a new PopServerConnection.
   * @param popSocket the socket.
   */
  public constructor(
    public readonly server: PopServer,
    public readonly popSocket: PopSocket,
    public readonly session: PopServerSession
  ) {
    super();

    // Registers the event listeners.
    this.popSocket.on("close", (had_error: boolean) =>
      this._handleClose(had_error)
    );

    // Creates the stream.
    this.stream = new PopServerStream({}, (data: string) =>
      this._handleCommand(data)
    );
    this.popSocket.socket.pipe(this.stream);
  }

  /**
   * Begins the server connection (listens and sends initial line).
   * @returns ourselves.
   */
  public async begin(): Promise<void> {
    // Sends the greeting.
    this.popSocket.write(
      new PopResponse(PopResponseType.Success, [
        this.session.language.success.greeting(this),
        this.session.banner.encode(),
      ]).encode(true)
    );
  }

  /**
   * Gets called when the socket closed.
   * @param had_error if there was an error (net-only).
   */
  protected _handleClose(had_error: boolean): void {}

  /**
   * Handles a single pop command.
   * @param data the command date.
   */
  protected async _handleCommand(data: string): Promise<void> {
    try {
      const command: PopCommand = PopCommand.decode(data);
      switch (command.type) {
        case PopCommandType.Capa:
          this._handleCapabilityCommand();
          break;
        case PopCommandType.Quit:
          await this._handleQuitCommand();
          break;
        case PopCommandType.Lang:
          this._handleLanguageCommand(command);
          break;
        case PopCommandType.User:
          await this._handleUserCommand(command);
          break;
        case PopCommandType.Pass:
          await this._handle_pass(command);
          break;
        case PopCommandType.Stat:
          this._handleStatisticsCommand();
          break;
        case PopCommandType.Uidl:
          this._handleUidListCommand(command);
          break;
        case PopCommandType.Retr:
          await this._handleRetreiveCommand(command);
          break;
        case PopCommandType.List:
          await this._handleListCommand(command);
          break;
        case PopCommandType.Noop:
          await this._handleNoopCommand();
          break;
        case PopCommandType.Rset:
          await this._handleResetCommand();
          break;
        case PopCommandType.Dele:
          await this._handleDeleteCommand(command);
          break;
        case PopCommandType.Apop:
          await this._handleApopCommand(command);
          break;
        case PopCommandType.Top:
          await this._handleTopCommand(command);
          break;
        default:
          this._handleNotImplemented(command);
          break;
      }
    } catch (e) {
      if (e instanceof PopInvalidCommandError) {
        // Writes the invalid command error code.
        this.popSocket.write(
          new PopResponse(
            PopResponseType.Failure,
            this.session.language.failure.invalid_command(this)
          ).encode(true)
        );

        // If there are too many invalid commands, close.
        if (++this.session.invalid_command_count > MAX_INVALID_COMMANDS) {
          this.popSocket.close();
        }
      } else if (e instanceof PopError) {
        // Writes the error.
        this.popSocket.write(
          new PopResponse(PopResponseType.Failure, e.message).encode(true)
        );
      } else {
        // Rethrow, this is an very-unexpected error.
        throw e;
      }
    }
  }

  /**
   * Handles the QUIT command.
   */
  protected async _handleQuitCommand(): Promise<void> {
    // Deletes all the messages.
    await this.server.config.deleteMessages(
      this,
      this.session.messages?.filter(function (message) {
        return message.flags.are_set(PopMessageFlag.Delete);
      }) ?? []
    );

    // Writes the response.
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.quit(this)
      ).encode(true)
    );
    this.popSocket.close();
  }

  /**
   * Handles the NOOP command.
   */
  protected _handleNoopCommand(): void {
    this.popSocket.write(
      new PopResponse(PopResponseType.Success, null).encode(true)
    );
  }

  /**
   * Handles the capability command.
   */
  protected _handleCapabilityCommand(): void {
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.capa(this)
      ).encode(true)
    );
    for (const capability of CAPABILITIES) {
      PopMultilineResponse.write_line(capability.encode(), this.popSocket);
    }
    PopMultilineResponse.write_end(this.popSocket);
  }

  /**
   * Handles the TOP command.
   * @param command the command.
   */
  protected async _handleTopCommand(command: PopCommand): Promise<void> {
    // Makes sure we're in transaction state.
    if (this.session.state !== PopSessionState.Transaction) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.Stat,
            PopSessionState.Transaction,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Makes sure there are messages at all.
    if (!this.session.messages) {
      throw new PopError("Session has not loaded messages yet.");
    }

    // Makes sure there is a argument at all.
    if (!command.arguments || command.arguments.length != 2) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_params(
            PopCommandType.Top,
            2,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Gets the index and subtracts one, and if the message does not exist
    //  send an error.
    const index: number = parseInt(command.arguments[0]) - 1;
    if (index < 0 || index >= this.session.messages.length) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.no_such_message(this)
        ).encode(true)
      );
      return;
    }

    // Gets the number of lines after header.
    const desired_lines_after_header: number = parseInt(command.arguments[1]);

    // Gets the message.
    let message: PopMessage = this.session.messages[index];

    // Checks if the message is marked for deletion already.
    if (message.flags.are_set(PopMessageFlag.Delete)) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.message_deleted(index, this)
        ).encode(true)
      );
      return;
    }

    // Splits the message, and gets the lines we're interested in.
    const message_lines: string[] = (await message.contents()).split(
      LINE_SEPARATOR
    );

    // Gets the number of lines we should send.
    const first_empty_line: number = message_lines.indexOf("");
    let end_index: number = first_empty_line + desired_lines_after_header;
    if (end_index > message_lines.length) {
      end_index = message_lines.length;
    }

    // Sends the response.
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.top.base(this)
      ).encode()
    );
    for (let i = 0; i < end_index; ++i) {
      PopMultilineResponse.write_line(message_lines[i], this.popSocket);
    }
    PopMultilineResponse.write_end(this.popSocket);
  }

  /**
   * Handles the APOP command.
   * @param command the command.
   */
  protected async _handleApopCommand(command: PopCommand): Promise<void> {
    // Makes sure we're in the correct state.
    if (this.session.state !== PopSessionState.Authorization) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.Apop,
            PopSessionState.Authorization,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Makes sure there are two arguments.
    if (!command.arguments || command.arguments.length != 2) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_params(
            PopCommandType.User,
            2,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Gets the arguments.
    const args: string[] = command.arguments;
    const userArg: string = args[0];
    const digestArg: string = args[1];

    // Gets the email address from the user argument.
    let email: EmailAddress;
    try {
      email = EmailAddress.fromAddress(userArg);
    } catch (e: any) {
      if (e instanceof Error) {
        throw new PopInvalidCommandError(e.message);
      }

      throw e;
    }

    // Makes sure the user exists.
    const result: PopUser | null = await this.server.config.getUser(
      email,
      this
    );
    if (result === null) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.permission_denied(this),
          PopExtRespCode.Auth
        ).encode(true)
      );
      return;
    }

    // Sets the user.
    this.session.user = result;

    // Makes sure the user has a secret.
    if (this.session.user.secret === null) {
      // Sets the user to null, and writes a permission denied.
      this.session.user = null;
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.permission_denied(this),
          PopExtRespCode.Sys
        ).encode(true)
      );
      return;
    }

    // Checks the digest.
    const generated_digest: string = ApopDigest.generate(
      this.session.banner,
      this.session.user.secret
    );
    if (generated_digest !== digestArg) {
      this.session.user = null;
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.permission_denied(this),
          PopExtRespCode.Auth
        ).encode(true)
      );
      return;
    }

    // Checks if the user is already in an session.
    if (await this.server.config.hasExistingSession(this)) {
      this.session.user = null;
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.in_use(this),
          PopExtRespCode.InUse
        ).encode(true)
      );
      return;
    }

    // Updates the session.
    this.session.state = PopSessionState.Transaction;

    // Loads the messages.
    this.session.messages = await this.server.config.getMessages(this);

    // Sends the success message.
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.apop.logged_in(this)
      ).encode(true)
    );
  }

  /**
   * Handles the RSET command.
   */
  protected _handleResetCommand(): void {
    // Makes sure we're in transaction state.
    if (this.session.state !== PopSessionState.Transaction) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.Rset,
            PopSessionState.Transaction,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Removes the delete flags from each message.
    this.session.messages?.forEach((message) => {
      message.flags.clear(PopMessageFlag.Delete);
    });

    // Sends the success.
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.rset(this)
      ).encode(true)
    );
  }

  /**
   * Handles the LIST command.
   * @param command the command.
   */
  protected _handleListCommand(command: PopCommand): void {
    // Makes sure we're in transaction state.
    if (this.session.state !== PopSessionState.Transaction) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.List,
            PopSessionState.Transaction,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Makes sure there are any messages in the first place.
    if (!this.session.messages) {
      throw new PopError("Session has not loaded messages yet.");
    }

    // Checks if we have an argument, if so we need to fetch a specific one.
    if (command.arguments) {
      // If there are arguments but not the correct amount, throw an error.
      if (command.arguments.length !== 1) {
        this.popSocket.write(
          new PopResponse(
            PopResponseType.Failure,
            this.session.language.failure.invalid_params(
              PopCommandType.List,
              1,
              this
            )
          ).encode(true)
        );
        return;
      }

      // Gets the index and subtracts one, and if the message does not exist
      //  send an error.
      const index: number = parseInt(command.arguments[0]) - 1;
      if (index < 0 || index >= this.session.messages.length) {
        this.popSocket.write(
          new PopResponse(
            PopResponseType.Failure,
            this.session.language.failure.no_such_message(this)
          ).encode(true)
        );
        return;
      }

      // Gets the message.
      const message: PopMessage = this.session.messages[index];

      // Checks if it's deleted.
      if (message.flags.are_set(PopMessageFlag.Delete)) {
        this.popSocket.write(
          new PopResponse(
            PopResponseType.Failure,
            this.session.language.failure.message_deleted(index, this)
          ).encode(true)
        );
        return;
      }

      // Sends the UID for the given message.
      this.popSocket.write(
        new PopResponse(PopResponseType.Success, [
          (index + 1).toString(),
          message.size.toString(),
        ]).encode(true)
      );
      return;
    }

    // Writes the success mesasge.
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.list(this)
      ).encode(true)
    );

    // Writes the list of all message sizes.
    this.session.messages.forEach(
      (message: PopMessage, index: number) => {
        PopMultilineResponse.write_line(
          [(index + 1).toString(), message.size.toString()],
          this.popSocket
        );
      }
    );
    PopMultilineResponse.write_end(this.popSocket);
  }

  /**
   * Handles the DELE command.
   * @param command the command.
   */
  protected _handleDeleteCommand(command: PopCommand): void {
    // Makes sure we're in the transaction state.
    if (this.session.state !== PopSessionState.Transaction) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.Dele,
            PopSessionState.Transaction,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Makes sure there are messages at all.
    if (!this.session.messages) {
      throw new PopError("Session has not loaded messages yet.");
    }

    // Makes sure there is a argument at all.
    if (!command.arguments || command.arguments.length != 1) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_params(
            PopCommandType.Pass,
            1,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Gets the index and subtracts one, and if the message does not exist
    //  send an error.
    const index: number = parseInt(command.arguments[0]) - 1;
    if (index < 0 || index >= this.session.messages.length) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.no_such_message(this)
        ).encode(true)
      );
      return;
    }

    // Gets the message.
    let message: PopMessage = this.session.messages[index];

    // Checks if the message is marked for deletion already.
    if (message.flags.are_set(PopMessageFlag.Delete)) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.dele.already_deleted(index, this)
        ).encode(true)
      );
      return;
    }

    // Marks the message for deletion.
    message.flags.set(PopMessageFlag.Delete);

    // Sends the success.
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.dele.deleted(index, this)
      ).encode(true)
    );
  }

  /**
   * Handles the RETR command.
   * @param command the command.
   */
  protected async _handleRetreiveCommand(command: PopCommand): Promise<void> {
    // Makes sure we're in the transaction state.
    if (this.session.state !== PopSessionState.Transaction) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.Retr,
            PopSessionState.Transaction,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Makes sure there are messages at all.
    if (!this.session.messages) {
      throw new PopError("Session has not loaded messages yet.");
    }

    // Makes sure there is a argument at all.
    if (!command.arguments || command.arguments.length != 1) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_params(
            PopCommandType.Pass,
            1,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Gets the index and subtracts one, and if the message does not exist
    //  send an error.
    const index: number = parseInt(command.arguments[0]) - 1;
    if (index < 0 || index >= this.session.messages.length) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.no_such_message(this)
        ).encode(true)
      );
      return;
    }

    // Gets the message.
    const message: PopMessage = this.session.messages[index];

    // Checks if it's deleted.
    if (message.flags.are_set(PopMessageFlag.Delete)) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.message_deleted(index, this)
        ).encode(true)
      );
      return;
    }

    // Gets the contents.
    const content: string = await message.contents();

    // Splits the message content into lines (this is required to filter for dots.);
    const splitted_content: string[] = content.split(LINE_SEPARATOR);

    // Sends the success response.
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.retr(message, this)
      ).encode(true)
    );

    // Sends the lines.
    for (const line of splitted_content) {
      PopMultilineResponse.write_line(line, this.popSocket);
    }
    PopMultilineResponse.write_end(this.popSocket);
  }

  /**
   * Handles the STAT command.
   */
  protected _handleStatisticsCommand(): void {
    // Makes sure we're in the transaction state.
    if (this.session.state !== PopSessionState.Transaction) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.Stat,
            PopSessionState.Transaction,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Makes sure there are messages at all.
    if (!this.session.messages) {
      throw new PopError("Session has not loaded messages yet.");
    }

    // Writes the status response.
    this.popSocket.write(
      new PopResponse(PopResponseType.Success, [
        this.session.available_message_count.toString(),
        this.session.available_messages_size_sum.toString(),
      ]).encode(true)
    );
  }

  /**
   * Handles the UIDL command.
   */
  protected _handleUidListCommand(command: PopCommand): void {
    // Makes sure we're in transaction state.
    if (this.session.state !== PopSessionState.Transaction) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.Uidl,
            PopSessionState.Transaction,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Makes sure there are any messages in the first place.
    if (!this.session.messages) {
      throw new PopError("Session has not loaded messages yet.");
    }

    // Checks if we have an argument, if so we need to fetch a specific one.
    if (command.arguments) {
      // If there are arguments but not the correct amount, throw an error.
      if (command.arguments.length !== 1) {
        this.popSocket.write(
          new PopResponse(
            PopResponseType.Failure,
            this.session.language.failure.invalid_params(
              PopCommandType.Uidl,
              1,
              this
            )
          ).encode(true)
        );
        return;
      }

      // Gets the index and subtracts one, and if the message does not exist
      //  send an error.
      const index: number = parseInt(command.arguments[0]) - 1;
      if (index < 0 || index >= this.session.messages.length) {
        this.popSocket.write(
          new PopResponse(
            PopResponseType.Failure,
            this.session.language.failure.no_such_message(this)
          ).encode(true)
        );
        return;
      }

      // Gets the message.
      const message: PopMessage = this.session.messages[index];

      // Checks if it's deleted.
      if (message.flags.are_set(PopMessageFlag.Delete)) {
        this.popSocket.write(
          new PopResponse(
            PopResponseType.Failure,
            this.session.language.failure.message_deleted(index, this)
          ).encode(true)
        );
        return;
      }

      // Sends the UID for the given message.
      this.popSocket.write(
        new PopResponse(PopResponseType.Success, [
          (index + 1).toString(),
          message.uid_string,
        ]).encode(true)
      );
      return;
    }

    // Writes the success mesasge.
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.uidl.all(this)
      ).encode(true)
    );

    // Writes the list of all message ID's.
    this.session.messages.forEach(
      (message: PopMessage, index: number) => {
        PopMultilineResponse.write_line(
          [(index + 1).toString(), message.uid_string],
          this.popSocket
        );
      }
    );
    PopMultilineResponse.write_end(this.popSocket);
  }

  /**
   * Handles the lang command.
   * @param command the command.
   */
  protected _handleLanguageCommand(command: PopCommand): void {
    // If no arguments, list languages.
    if (!command.arguments) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Success,
          this.session.language.success.language.list(this)
        ).encode(true)
      );

      for (const [key, value] of Object.entries(LanguageName)) {
        PopMultilineResponse.write_line(`${value} ${key}`, this.popSocket);
      }
      PopMultilineResponse.write_end(this.popSocket);
      return;
    }

    // Checks if the number of arguments is valid.
    if (command.arguments.length != 1) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_params(
            PopCommandType.Lang,
            1,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Makes sure the given language is valid.
    const lang: string = command.arguments[0];
    if (!Object.values(LanguageName).includes(lang as LanguageName)) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.language.invalid(lang, this)
        ).encode(true)
      );
      return;
    }

    // Update the language.
    this.session.language = getLanguage(lang as LanguageName) as Language;
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.language.changing(lang, this)
      ).encode(true)
    );
  }

  /**
   * Handles the user command.
   * @param command the command.
   */
  protected async _handleUserCommand(command: PopCommand): Promise<void> {
    // Makes sure we're in the correct state.
    if (this.session.state !== PopSessionState.Authorization) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.User,
            PopSessionState.Authorization,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Checks if there is an user alreadu.
    if (this.session.user) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.user.already_executed(this)
        ).encode(true)
      );
      return;
    }

    // Checks if there are arguments.
    if (!command.arguments || command.arguments.length != 1) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_params(
            PopCommandType.User,
            1,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Gets the user, and fetches the PopUser.
    const userArg: string = command.arguments[0];

    // Parses the email from the user arg.
    let email: EmailAddress;
    try {
      email = EmailAddress.fromAddress(userArg);
    } catch (e: any) {
      if (e instanceof Error) {
        throw SyntaxError(e.message);
      }

      throw e;
    }

    // Gets the pop user.
    const result: PopUser | null = await this.server.config.getUser(
      email,
      this
    );

    // Makes sure the user was found.
    if (result === null) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.user.rejected(this)
        ).encode(true)
      );
      return;
    }

    // Updates the session and writes the response.
    this.session.user = result;
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.user.accepted(this)
      ).encode(true)
    );
  }

  /**
   * Handles the pass command.
   * @param command the command.
   */
  protected async _handle_pass(command: PopCommand): Promise<void> {
    // Makes sure we're in the correct state.
    if (this.session.state !== PopSessionState.Authorization) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_state(
            PopCommandType.Pass,
            PopSessionState.Authorization,
            this
          )
        ).encode(true)
      );
      return;
    }

    // If there is no user yet, throw error.
    if (!this.session.user) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.execute_command_first(
            PopCommandType.Pass,
            PopCommandType.User,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Makes sure there are arguments.
    if (!command.arguments || command.arguments.length != 1) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.invalid_params(
            PopCommandType.Pass,
            1,
            this
          )
        ).encode(true)
      );
      return;
    }

    // Gets the password from the arguments.
    const pass: string = command.arguments[0];

    // Checks the password.
    if (
      !(await this.server.config.comparePassword(pass, this.session.user.pass))
    ) {
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.pass.rejected(this),
          PopExtRespCode.Auth
        ).encode(true)
      );
      return;
    }

    // Checks if the user is already in an session.
    if (await this.server.config.hasExistingSession(this)) {
      this.session.user = null;
      this.popSocket.write(
        new PopResponse(
          PopResponseType.Failure,
          this.session.language.failure.in_use(this),
          PopExtRespCode.InUse
        ).encode(true)
      );
      return;
    }

    // Updates the state.
    this.session.state = PopSessionState.Transaction;
    this.session.messages = await this.server.config.getMessages(this);

    // Writes the success.
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Success,
        this.session.language.success.pass.accepted(this)
      ).encode(true)
    );
  }

  /**
   * Gets called when a command is not implemented.
   *
   * @param command the command.
   */
  protected _handleNotImplemented(command: PopCommand): void {
    this.popSocket.write(
      new PopResponse(
        PopResponseType.Failure,
        this.session.language.failure.command_not_implemented(
          command.type,
          this
        )
      ).encode(true)
    );
  }
}
