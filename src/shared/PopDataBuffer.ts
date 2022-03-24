import { LINE_SEPARATOR } from "./Constants";

export class PopDataBuffer {
    protected buffer: string;

    /**
     * Constructs a new segmented reader.
     */
    public constructor () {
        this.buffer = '';
    }

    /**
     * Writes an chunk to the segmented reader.
     * @param chunk the chunk.
     */
    public write(chunk: Buffer): void {
        this.buffer += chunk.toString('utf-8');
    }

    /**
     * Reads the given size from the buffer.
     * @param size the size to read.
     * @returns the data.
     */
    public read(size: number): string {
        // Checks if there is enough data.
        if (size > this.buffer.length) {
            throw new Error('Size is larger than the buffer size.');
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

    /**
     * Gets the length of the buffer.
     * @returns the length of the buffer.
     */
    public get length(): number {
        return this.buffer.length;
    }
}

