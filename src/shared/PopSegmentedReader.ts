import { EventEmitter, Stream } from "stream";
import { LINE_SEPARATOR } from "./Constants";

export class PopSegmentedReader extends EventEmitter {
    protected buffer: string;
    
    public constructor (public readonly separator: string = LINE_SEPARATOR) {
        super();

        this.buffer = '';
    }

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

