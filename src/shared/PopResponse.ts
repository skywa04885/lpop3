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

export enum PopResponseType {
    Success = '+OK',
    Failure = '-ERR',
}

export class PopResponse {
    /**
     * Constructs a new PopResponse.
     * @param type the type of response.
     * @param message the message.
     */
    public constructor(public readonly type: PopResponseType, public readonly message: string | string[]) { }

    /**
     * Encodes the current response instance.
     * @param add_newline if it should add a LINE_SEPARATOR at the end.
     * @returns the encoded response.
     */
    public encode(add_newline: boolean = true) {
        let arr: string[] = [];

        arr.push(this.type);

        if (typeof(this.message) === 'string') {
            arr.push(this.message.trim());
        } else {
            for (const m of this.message) {
                arr.push(m.trim());
            }
        }

        let result_string: string = arr.join(SEGMENT_SEPARATOR);

        if (add_newline) {
            result_string += LINE_SEPARATOR;
        }

        return result_string;
    }

    /**
     * Decodes the given response string.
     * @param raw the raw response.
     * @returns the parsed response.
     */
    public static decode(raw: string): PopResponse {
        raw = raw.trim();

        const split_index: number = raw.indexOf(SEGMENT_SEPARATOR);
        if (split_index === -1) {
            throw new Error('Raw string does not contain any separator.');
        }

        const raw_type: string = raw.substring(0, split_index).trim().toUpperCase();
        const raw_message: string = raw.substring(split_index + 1).trim();
        
        if (!Object.values(PopResponseType).includes(raw_type as PopResponseType))
        {
            throw new Error('Invalid response type.');
        }

        return new PopResponse(raw_type as PopResponseType, raw_message);
    }
}