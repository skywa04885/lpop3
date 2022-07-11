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

import {Writable, WritableOptions} from "stream";
import {LINE_SEPARATOR} from "../shared/Constants";
import {PopDataBuffer} from "../shared/PopDataBuffer";

export class PopServerStream extends Writable {
  protected _buffer: PopDataBuffer = new PopDataBuffer();

  /**
   * Constructs a new SMTP stream.
   * @param options the options.
   */
  public constructor(
    options: WritableOptions,
    public readonly on_command: (data: string) => Promise<void>
  ) {
    super(options);
  }

  /**
   * Handles a new chunk of data.
   * @param chunk the chunk of data.
   * @param encoding the encoding.
   * @param callback the callback.
   * @returns nothing.
   */
  public async _write(
    chunk: Buffer,
    encoding: BufferEncoding,
    next: (error?: Error | null) => void
  ): Promise<void> {
    // Checks if there is anything to read at all.
    if (!chunk || chunk.length === 0) {
      next();
      return;
    }

    // Writes the chunk to the buffer.
    this._buffer.write(chunk);

    // Handles the command write.
    await this._handle_command_write();

    // Goes to the next chunk.
    next();
  }

  /**
   * Handles a command write.
   */
  protected async _handle_command_write(): Promise<void> {
    // Reads the segment, and if not there just return.
    let segment: string | null;
    if ((segment = this._buffer.segment(LINE_SEPARATOR)) === null) {
      return;
    }

    // Calls the command callback.
    await this.on_command(segment);
  }
}
