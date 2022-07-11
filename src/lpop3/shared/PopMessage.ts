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

import {Readable} from "stream";
import {Flags} from "llibdatastructures";

export enum PopMessageFlag {
  Delete = 1 << 0,
}

export class PopMessage {
  /**
   * Constructs a new pop message.
   * @param uid the unique identifier.
   * @param size the size.
   * @param flags the flags.
   */
  public constructor(
    public readonly uid: string | number,
    public readonly size: number,
    public flags: Flags = new Flags()
  ) {}

  /**
   * Gets the UID as a string, even if it's a number.
   */
  public get uid_string(): string {
    if (typeof this.uid === "string") {
      return this.uid;
    }

    return this.uid.toString();
  }

  /**
   * Gets the contents of the message.
   * @returns the contents as a string.
   */
  public async contents(): Promise<string> {
    throw new Error('Not implemented');
  }
}
