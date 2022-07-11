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

import os from "os";

export class PopBanner {
  /**
   * Constructs a new PopBanner.
   * @param rand the random data.
   * @param hostname the hostname.
   */
  public constructor(
    public readonly rand: string = Date.now().toString(),
    public readonly hostname: string = os.hostname()
  ) {}

  /**
   * Decodes the given banner.
   * @param raw the raw banner.
   * @returns the decoded banner.
   */
  public static decode(raw: string): PopBanner {
    // Makes sure the end and start are correct.
    if (!raw.startsWith("<") || !raw.endsWith(">")) {
      throw new Error("Missing brackets in pop baner.");
    }

    // Gets the substring without brackets.
    raw = raw.substring(1, raw.length - 1);

    // Gets the random string and hostname.
    if (!raw.includes("@")) {
      throw new Error("Missing @");
    }

    let [rand, hostname] = raw.split("@");
    rand = rand.trim();
    hostname = hostname.trim();

    // Makes sure neither are empty.
    if (rand.length === 0 || hostname.length === 0) {
      throw new Error(
        "The hostname and random string must be larger than one."
      );
    }

    // Constructs and returns the pop banner.
    return new PopBanner(rand, hostname);
  }

  /**
   * Encodes the current PopBanner.
   * @returns the encoded version.
   */
  public encode(): string {
    return `<${this.rand}@${this.hostname}>`;
  }
}
