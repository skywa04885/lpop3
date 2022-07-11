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

export const Dutch = {
  failure: {
    user: {
      rejected: (connection: PopServerConnection) => {
        return `gebruiker geweigerd`;
      },
      already_executed: (connection: PopServerConnection) => {
        return `${PopCommandType.User} is al uitgevoerd, volg met ${PopCommandType.Pass}`;
      },
    },
    pass: {
      rejected: (connection: PopServerConnection) => {
        return `wachtwoord geweigerd`;
      },
    },
    invalid_state: (
      command_type: PopCommandType,
      required_state: PopSessionState,
      connection: PopServerConnection
    ) => {
      return `${command_type} opdracht mag alleen worden uitgevoerd in de ${required_state} staat.`;
    },
    invalid_params: (
      command_type: PopCommandType,
      params: number,
      connection: PopServerConnection
    ) => {
      return `${command_type} vereist ${params === 1 ? "een" : "meerdere"} ${
        params === 1 ? "argument" : "argumenten"
      }, niet meer, niet minder.`;
    },
    execute_command_first: (
      command_type: PopCommandType,
      execute_first_command_type: PopCommandType,
      connection: PopServerConnection
    ) => {
      return `opdracht ${execute_first_command_type} moet uitgevoerd worden voor ${command_type}.`;
    },
    command_not_implemented: (
      command_type: PopCommandType,
      connection: PopServerConnection
    ) => {
      return `opdracht ${command_type} is niet geïmplementeerd.`;
    },
    language: {
      invalid: (lang: string, connection: PopServerConnection) => {
        return `ongeldige taal '${lang}'.`;
      },
    },
    invalid_command: (conncetion: PopServerConnection) => {
      return "Ongeldige opdracht.";
    },
    dele: {
      already_deleted: (index: number, connection: PopServerConnection) => {
        return `bericht ${index} is al verwijderd.`;
      },
    },
    no_such_message: (connection: PopServerConnection) => {
      return `bericht bestaat niet, enkel ${connection.session.available_message_count} berichten in de maildrop.`;
    },
    permission_denied: (connection: PopServerConnection) => {
      return `toegang geweigerd.`;
    },
    in_use: (connection: PopServerConnection) => {
      return "heeft u nog een sessie open staan??";
    },
    message_deleted: (index: number, connection: PopServerConnection) => {
      return `bericht ${index} is verwijderd.`;
    },
  },
  success: {
    retr: (message: PopMessage, connection: PopServerConnection) => {
      return `${message.size} bytes`;
    },
    greeting: (connection: PopServerConnection) => {
      return `Luke-${
        connection.popSocket.secure ? "POP3S" : "POP3"
      } tot uw dienst, ${connection.popSocket.family} ${
        connection.popSocket.address
      }:${connection.popSocket.port}`;
    },
    capa: (connection: PopServerConnection) => {
      return `mogelijkheden volgen.`;
    },
    user: {
      accepted: (connection: PopServerConnection) => {
        return `gebruiker '${connection.session.user?.user}' geaccepteerd, volg met ${PopCommandType.Pass}`;
      },
    },
    pass: {
      accepted: (connection: PopServerConnection) => {
        return `wachtwoord geaccepteerd, welkom '${connection.session.user?.user}'.`;
      },
    },
    quit: (connection: PopServerConnection) => {
      return `Luke-${
        connection.popSocket.secure ? "POP3S" : "POP3"
      } meld zich af.`;
    },
    uidl: {
      all: (connection: PopServerConnection) => {
        return "de lijst van berichten volgt.";
      },
    },
    list: (connection: PopServerConnection) => {
      return `${connection.session.available_message_count} (${connection.session.available_messages_size_sum} bytes)`;
    },
    rset: (connection: PopServerConnection) => {
      return `maildrop heeft ${connection.session.available_message_count} berichten (${connection.session.available_messages_size_sum} bytes).`;
    },
    dele: {
      deleted: (index: number, connection: PopServerConnection) => {
        return `bericht ${index} is verwijderd.`;
      },
    },
    language: {
      changing: (lang: string, connection: PopServerConnection) => {
        return `taal wordt veranderd naar '${lang}'.`;
      },
      list: (connection: PopServerConnection) => {
        return "lijst van talen volgt.";
      },
    },
    apop: {
      logged_in: (connection: PopServerConnection) => {
        return `maildrop heeft ${connection.session.available_message_count} berichten (${connection.session.available_messages_size_sum} bytes)`;
      },
    },
    top: {
      base: (connection: PopServerConnection) => {
        return `top volgt.`;
      },
    },
  },
} as Language;
