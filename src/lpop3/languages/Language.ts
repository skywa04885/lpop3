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

import {PopServerConnection} from "../server/PopServerConnection";
import {PopCommandType} from "../shared/PopCommand";
import {PopMessage} from "../shared/PopMessage";
import {PopSessionState} from "../shared/PopSession";

export enum LanguageName {
  English = "en",
  Dutch = "nl",
}

export interface Language {
  failure: {
    user: {
      rejected: (connection: PopServerConnection) => string;
      already_executed: (connection: PopServerConnection) => string;
    };
    pass: {
      rejected: (connection: PopServerConnection) => string;
    };
    invalid_state: (
      command_type: PopCommandType,
      required_state: PopSessionState,
      connection: PopServerConnection
    ) => string;
    invalid_params: (
      command_type: PopCommandType,
      params: number,
      connection: PopServerConnection
    ) => string;
    execute_command_first: (
      command_type: PopCommandType,
      execute_first_command_type: PopCommandType,
      connection: PopServerConnection
    ) => string;
    command_not_implemented: (
      command_type: PopCommandType,
      connection: PopServerConnection
    ) => string;
    language: {
      invalid: (lang: string, connection: PopServerConnection) => string;
    };
    dele: {
      already_deleted: (
        index: number,
        connection: PopServerConnection
      ) => string;
    };
    no_such_message: (connection: PopServerConnection) => string;
    message_deleted: (index: number, connection: PopServerConnection) => string;
    invalid_command: (connection: PopServerConnection) => string;
    permission_denied: (connection: PopServerConnection) => string;
    in_use: (connection: PopServerConnection) => string;
  };
  success: {
    greeting: (connection: PopServerConnection) => string;
    capa: (connection: PopServerConnection) => string;
    user: {
      accepted: (connection: PopServerConnection) => string;
    };
    pass: {
      accepted: (connection: PopServerConnection) => string;
    };
    quit: (connetion: PopServerConnection) => string;
    uidl: {
      all: (connection: PopServerConnection) => string;
    };
    retr: (message: PopMessage, connection: PopServerConnection) => string;
    list: (connection: PopServerConnection) => string;
    rset: (connection: PopServerConnection) => string;
    dele: {
      deleted: (index: number, connection: PopServerConnection) => string;
    };
    language: {
      changing: (lang: string, connection: PopServerConnection) => string;
      list: (connection: PopServerConnection) => string;
    };
    apop: {
      logged_in: (connection: PopServerConnection) => string;
    };
    top: {
      base: (connection: PopServerConnection) => string;
    };
  };
}
