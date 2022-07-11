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

import { LINE_SEPARATOR, SEGMENT_SEPARATOR } from "./Constants";
import { PopSocket } from "./PopSocket";

export class PopMultilineResponse {
  /**
   * Writes a line part of a multiline response.
   * @param line the line to write.
   * @param pop_sock the socket to write to.
   * @returns if everything is written directly.
   */
  public static write_line(
    line: string | string[],
    pop_sock: PopSocket
  ): boolean {
    let final_line: string;

    if (typeof line === "string") {
      final_line = line; // Did .trim() first, LMFAO I'm such a retard.
    } else {
      final_line = line
        .map((segment) => segment.trim())
        .join(SEGMENT_SEPARATOR);
    }

    if (final_line === ".") {
      final_line += ".";
    }

    final_line += LINE_SEPARATOR;

    return pop_sock.write(final_line);
  }

  /**
   * Writes the end of a multiline response.
   * @param pop_sock the socket to write to.
   * @returns if it was written completely.
   */
  public static write_end(pop_sock: PopSocket) {
    return pop_sock.write(`.${LINE_SEPARATOR}`);
  }
}
