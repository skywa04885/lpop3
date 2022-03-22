import { LINE_SEPARATOR, SEGMENT_SEPARATOR } from "./Constants";
import { PopSocket } from "./PopSocket";

export class PopMultilineResponse {
    /**
     * Writes an line part of a multiline response.
     * @param line the line to write.
     * @param pop_sock the socket to write to.
     * @returns if everything is written directly.
     */
    public static write_line(line: string | string[], pop_sock: PopSocket): boolean {
        let final_line: string;

        if(typeof (line) === 'string') {
            final_line = line.trim();
        } else {
            final_line = line.map(segment => segment.trim()).join(SEGMENT_SEPARATOR);
        }

        if (final_line === '.') {
            final_line += '.';
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
