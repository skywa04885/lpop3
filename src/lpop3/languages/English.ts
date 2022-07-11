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
import {Language} from "./Language";

export const English = {
  failure: {
    user: {
      rejected: (connection: PopServerConnection) => {
        return `user rejected`;
      },
      already_executed: (connection: PopServerConnection) => {
        return `${PopCommandType.User} already executed, follow with ${PopCommandType.Pass}`;
      },
    },
    pass: {
      rejected: (connection: PopServerConnection) => {
        return `pass rejected`;
      },
    },
    invalid_state: (
      command_type: PopCommandType,
      required_state: PopSessionState,
      connection: PopServerConnection
    ) => {
      return `${command_type} command may only be executed in the ${required_state} state.`;
    },
    invalid_params: (
      command_type: PopCommandType,
      params: number,
      connection: PopServerConnection
    ) => {
      return `${command_type} requires ${params === 1 ? "one" : "multiple"} ${
        params === 1 ? "parameters" : "parameter"
      }, not more not less.`;
    },
    execute_command_first: (
      command_type: PopCommandType,
      execute_first_command_type: PopCommandType,
      connection: PopServerConnection
    ) => {
      return `command ${execute_first_command_type} must be executed before ${command_type}.`;
    },
    command_not_implemented: (
      command_type: PopCommandType,
      connection: PopServerConnection
    ) => {
      return `command ${command_type} is not implemented.`;
    },
    language: {
      invalid: (lang: string, connection: PopServerConnection) => {
        return `invalid language '${lang}'.`;
      },
    },
    invalid_command: (conncetion: PopServerConnection) => {
      return "invalid command.";
    },
    dele: {
      already_deleted: (index: number, connection: PopServerConnection) => {
        return `message ${index} already deleted.`;
      },
    },
    no_such_message: (connection: PopServerConnection) => {
      return `no such message, only ${connection.session.available_message_count} messages in maildrop.`;
    },
    permission_denied: (connection: PopServerConnection) => {
      return `permission denied.`;
    },
    in_use: (connection: PopServerConnection) => {
      return "do you have another POP session running?";
    },
    message_deleted: (index: number, connection: PopServerConnection) => {
      return `message ${index} has been deleted.`;
    },
  },
  success: {
    retr: (message: PopMessage, connection: PopServerConnection) => {
      return `${message.size} octets`;
    },
    greeting: (connection: PopServerConnection) => {
      return `Luke-${
        connection.popSocket.secure ? "POP3S" : "POP3"
      } at your service, ${connection.popSocket.family} ${
        connection.popSocket.address
      }:${connection.popSocket.port}`;
    },
    capa: (connection: PopServerConnection) => {
      return `capabilities follow.`;
    },
    user: {
      accepted: (connection: PopServerConnection) => {
        return `user '${connection.session.user?.user}' accepted, proceed with ${PopCommandType.Pass}`;
      },
    },
    pass: {
      accepted: (connection: PopServerConnection) => {
        return `pass accepted, welcome '${connection.session.user?.user}'.`;
      },
    },
    quit: (connection: PopServerConnection) => {
      return `Luke-${
        connection.popSocket.secure ? "POP3S" : "POP3"
      } signing off.`;
    },
    uidl: {
      all: (connection: PopServerConnection) => {
        return "mailbox listing follows.";
      },
    },
    list: (connection: PopServerConnection) => {
      return `${connection.session.available_message_count} (${connection.session.available_messages_size_sum} octets)`;
    },
    rset: (connection: PopServerConnection) => {
      return `maildrop has ${connection.session.available_message_count} messages (${connection.session.available_messages_size_sum} octets).`;
    },
    dele: {
      deleted: (index: number, connection: PopServerConnection) => {
        return `message ${index} deleted.`;
      },
    },
    language: {
      changing: (lang: string, connection: PopServerConnection) => {
        return `changing language to '${lang}'.`;
      },
      list: (connection: PopServerConnection) => {
        return "language listing follows.";
      },
    },
    apop: {
      logged_in: (connection: PopServerConnection) => {
        return `maildrop has ${connection.session.available_message_count} messages (${connection.session.available_messages_size_sum} octets)`;
      },
    },
    top: {
      base: (connection: PopServerConnection) => {
        return `top follows.`;
      },
    },
  },
} as Language;
