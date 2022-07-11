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

import {LINE_SEPARATOR} from "./Constants";

export class PopDataBuffer {
  protected buffer: string;

  /**
   * Constructs a new segmented reader.
   */
  public constructor() {
    this.buffer = "";
  }

  /**
   * Gets the length of the buffer.
   * @returns the length of the buffer.
   */
  public get length(): number {
    return this.buffer.length;
  }

  /**
   * Writes an chunk to the segmented reader.
   * @param chunk the chunk.
   */
  public write(chunk: Buffer): void {
    this.buffer += chunk.toString("utf-8");
  }

  /**
   * Reads the given size from the buffer.
   * @param size the size to read.
   * @returns the data.
   */
  public read(size: number): string {
    // Checks if there is enough data.
    if (size > this.buffer.length) {
      throw new Error("Size is larger than the buffer size.");
    }

    // Gets the data.
    const data: string = this.buffer.substring(0, size);

    // Trims the data from the buffer.
    this.buffer = this.buffer.substring(size);

    // Returns the data.
    return data;
  }

  /**
   * Gets an segment from the segmented reader.
   * @param separator the separator.
   * @param add gets added to the index of the segment subtraction, allows some chars to be preserved of the separator.
   * @returns the segment.
   */
  public segment(separator = LINE_SEPARATOR, add: number = 0): string | null {
    // Gets the separator index.
    let index: number = this.buffer.lastIndexOf(separator);
    if (index === -1) {
      return null;
    }

    // Gets the segment.
    const segment = this.buffer.substring(0, index + add);

    // Removes the segment from the buffer.
    this.buffer = this.buffer.substring(index + separator.length);

    // Returns the segment.
    return segment;
  }
}
