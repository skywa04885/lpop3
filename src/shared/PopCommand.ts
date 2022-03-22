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

export enum PopCommandType {
    User = 'USER',
    Pass = 'PASS',
    Quit = 'QUIT',
    Stat = 'STAT',
    List = 'LIST',
    Retr = 'RETR',
    Dele = 'DELE',
    Noop = 'NOOP',
    Rset = 'RSET',
    Top = 'TOP',
    Uidl = 'UIDL',
    Capa = 'CAPA',
}

export class PopCommand {
    /**
     * Constructs a new PopCommand.
     * @param type the type of command.
     * @param args the arguments.
     */
    public constructor(public readonly type: PopCommandType, public readonly args: string) { }

    /**
     * Gets the args as a single string.
     */
    public get argument(): string {
        return this.args.trim();
    }

    /**
     * Gets the args as multiple arguments.
     */
    public get arguments(): string[] {
        return this.args.split(SEGMENT_SEPARATOR).map(function (arg) {
            return arg.trim();
        });
    }

    /**
     * Encodes the current command.
     * @param add_newline if the encoded version should include a  newline.
     */
    public encode(add_newline: boolean = true): string {
        let result_string: string = [this.type, this.args.trim()].join(SEGMENT_SEPARATOR);

        if (add_newline) {
            result_string += LINE_SEPARATOR;
        }

        return result_string;
    }

    /**
     * Decodes the given command string.
     * @param raw the raw command.
     * @returns the parsed command.
     */
    public static decode(raw: string): PopCommand {
        raw = raw.trim();

        const split_index: number = raw.indexOf(SEGMENT_SEPARATOR);
        if (split_index === -1) {
            throw new Error('Raw string does not contain any separator.');
        }

        const raw_type: string = raw.substring(0, split_index).trim().toUpperCase();
        const raw_args: string = raw.substring(split_index + 1).trim();

        if (!Object.values(PopCommandType).includes(raw_type as PopCommandType)) {
            throw new Error('Invalid command type.');
        }

        return new PopCommand(raw_type as PopCommandType, raw_args);
    }
}