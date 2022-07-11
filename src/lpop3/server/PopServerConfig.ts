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

import {Language, LanguageName} from "../languages/Language";
import {PopMessage} from "../shared/PopMessage";
import {PopUser} from "../shared/PopUser";
import {PopServerConnection} from "./PopServerConnection";
import {getLanguage} from "../languages/LanguageProvider";
import {EmailAddress} from "llibemailaddress";

export type IPopServerConfigGetUserCallback = (
  email: EmailAddress,
  connection: PopServerConnection
) => Promise<PopUser | null>;
export type IPopServerConfigHasExistingSessionCallback = (
  connection: PopServerConnection
) => Promise<boolean>;
export type IPopServerConfigComparePasswordCallback = (
  raw: string,
  hash: string
) => Promise<boolean>;
export type IPopServerConfigGetMessagesCallback = (
  connection: PopServerConnection
) => Promise<PopMessage[]>;
export type IPopServerConfigDeleteMessagesCallback = (
  connection: PopServerConnection,
  messages: PopMessage[]
) => Promise<void>;

export interface IPopServerConfigCallbacks {
  getUser?: IPopServerConfigGetUserCallback;
  hasExistingSession?: IPopServerConfigHasExistingSessionCallback;
  comparePassword?: IPopServerConfigComparePasswordCallback;
  getMessages?: IPopServerConfigGetMessagesCallback;
  deleteMessages?: IPopServerConfigDeleteMessagesCallback;
}

export class PopServerConfig {
  public getUser: IPopServerConfigGetUserCallback;
  public hasExistingSession: IPopServerConfigHasExistingSessionCallback;
  public comparePassword: IPopServerConfigComparePasswordCallback;
  public getMessages: IPopServerConfigGetMessagesCallback;
  public deleteMessages: IPopServerConfigDeleteMessagesCallback;

  public constructor(
    public readonly defaultLanguage: Language = getLanguage(
      LanguageName.English
    )!,
    callbacks: IPopServerConfigCallbacks = {}
  ) {
    this.getUser =
      callbacks.getUser ??
      (async (email: EmailAddress, connection: PopServerConnection) => {
        throw new Error("Not implemented!");
      });
    this.hasExistingSession =
      callbacks.hasExistingSession ??
      (async (connection: PopServerConnection) => {
        throw new Error("Not implemented!");
      });
    this.comparePassword =
      callbacks.comparePassword ??
      (async (raw: string, hash: string) => {
        throw new Error("Not implemented!");
      });
    this.getMessages =
      callbacks.getMessages ??
      (async (connection: PopServerConnection) => {
        throw new Error("Not implemented!");
      });
    this.deleteMessages =
      callbacks.deleteMessages ??
      (async (connection: PopServerConnection, messages: PopMessage[]) => {
        throw new Error("Not implemented!");
      });
  }
}
