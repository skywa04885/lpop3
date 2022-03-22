import { EventEmitter } from "stream";
import { LINE_SEPARATOR } from "./Constants";

export class PopSegmentedReader extends EventEmitter {
    protected buffer: string;
    protected segments: string[];

    /**
     * Constructs a new segmented reader.
     * @param separator the separator.
     */
    public constructor (public readonly separator: string = LINE_SEPARATOR) {
        super();

        this.buffer = '';
        this.segments = [];
    }

    /**
     * Writes data to the segmented buffer.
     * @param data the data to add.
     */
    public write(data: string) {        
        this.buffer += data;

        let index: number = this.buffer.indexOf(this.separator);
        while (index !== -1)
        {
            this.emit('segment', this.buffer.substring(0, index));
            this.buffer = this.buffer.substring(index + this.separator.length);
            index = this.buffer.indexOf(this.separator);
        }
    }
}

