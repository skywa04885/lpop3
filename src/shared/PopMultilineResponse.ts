import { LINE_SEPARATOR } from "./Constants";

export class PopMultilineResponse {
    public constructor(public readonly lines: string[]) { }

    /**
     * Encodes a multiline response.
     * @param add_newline if we should add a newline at the end.
     * @returns the encoded multiline response.
     */
    public encode(add_newline: boolean = true): string {
        let arr: string[] = [];

        for (const line of this.lines) {
            if (line == '.') { // We need to escape the dots.
                arr.push('..');
                continue;
            }

            arr.push(line.trim());
        }

        arr.push('.');

        let result_string: string = arr.join(LINE_SEPARATOR);

        if (add_newline) {
            result_string += LINE_SEPARATOR;
        }

        return result_string;
    }
}