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

import {Language} from "../languages/Language";
import {PopBanner} from "../shared/PopBanner";
import {PopMessage, PopMessageFlag} from "../shared/PopMessage";
import {PopSession, PopSessionState} from "../shared/PopSession";
import {PopUser} from "../shared/PopUser";

export const DEFAULT_POP_SERVER_STATE_TYPE: PopSessionState =
  PopSessionState.Authorization;

export class PopServerSession extends PopSession {
  public user: PopUser | null;
  public invalid_command_count: number;
  public messages: PopMessage[] | null;
  public banner: PopBanner;

  public constructor(public language: Language) {
    super(DEFAULT_POP_SERVER_STATE_TYPE);
    this.user = null;
    this.messages = null;
    this.invalid_command_count = 0;
    this.banner = new PopBanner();
  }

  /**
   * Gets the total size of all messages.
   */
  public get available_messages_size_sum(): number {
    let total_size: number = 0;
    this.messages?.forEach((message: PopMessage) => {
      if (message.flags.are_set(PopMessageFlag.Delete)) {
        return;
      }

      total_size += message.size;
    });
    return total_size;
  }

  /**
   * Gets the number of available messages.
   * @returns the number of available messages.
   */
  public get available_message_count(): number {
    if (!this.messages) {
      throw new Error("There are no messages to count.");
    }

    let result: number = 0;

    this.messages.forEach((message: PopMessage): void => {
      if (message.flags.are_clear(PopMessageFlag.Delete)) {
        ++result;
      }
    });

    return result;
  }
}
