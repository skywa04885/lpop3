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

import {SEGMENT_SEPARATOR} from "./Constants";

export enum PopCapabilityType {
  Implementation = "IMPLEMENTATION",
  LoginDelay = "LOGIN-DELAY",
  RespCodes = "RESP-CODES",
  AuthRespCode = "AUTH-RESP-CODE",
  Pipelining = "PIPELINING",
  Sasl = "SASL",
  User = "USER",
  Top = "TOP",
  Expire = "EXPIRE",
  Uidl = "UIDL",
  Stls = "STLS",
  Utf8 = "UTF8",
  Lang = "LANG",
}

export class PopCapability {
  /**
   * Constructs a new pop capability.
   * @param type the type of cabability.
   * @param args the arguments.
   */
  public constructor(
    public readonly type: PopCapabilityType,
    public readonly args: string | string[] | null = null
  ) {}

  /**
   * Encodes the capability.
   * @returns the encoded capability.
   */
  public encode(): string {
    let arr: string[] = [];

    arr.push(this.type);

    if (this.args !== null) {
      if (typeof this.args === "string") {
        arr.push(this.args.trim());
      } else {
        arr = arr.concat(this.args);
      }
    }

    return arr.join(SEGMENT_SEPARATOR);
  }
}
