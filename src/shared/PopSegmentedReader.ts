import { LINE_SEPARATOR } from "./Constants";

export class PopSegmentedReader {
    protected buffer: string;

    /**
     * Constructs a new segmented reader.
     * @param separator the separator.
     */
    public constructor (public readonly separator: string = LINE_SEPARATOR) {
        this.buffer = '';
    }

    /**
     * Writes data to the segmented buffer.
     * @param data the data to add.
     * @returns if it was empty.
     */
    public write(data: string) {
        const empty: boolean = this.empty;
        this.buffer += data;
        return empty;
    }

    /**
     * Checks if the segmented buffer is empty.
     */
    public get empty(): boolean {
        return this.buffer.length === 0;
    }

    /**
     * Generator to read the lines.
     */
    public *lines() {
        let index: number = this.buffer.indexOf(this.separator);
        while (index !== -1)
        {
            yield this.buffer.substring(0, index);

            this.buffer = this.buffer.substring(index + this.separator.length);
            index = this.buffer.indexOf(this.separator);
        }
    }
}

