import { Writable, WritableOptions } from 'stream';
import { LINE_SEPARATOR } from '../shared/Constants';
import { PopDataBuffer } from '../shared/PopDataBuffer';

export class PopServerStream extends Writable {
    protected _buffer: PopDataBuffer = new PopDataBuffer();

    /**
     * Constructs a new SMTP stream.
     * @param options the options.
     */
    public constructor(options: WritableOptions,
        public readonly on_command: (data: string) => Promise<void>) {
        super(options);
    }


    /**
     * Handles a new chunk of data.
     * @param chunk the chunk of data.
     * @param encoding the encoding.
     * @param callback the callback.
     * @returns nothing.
     */
    public async _write(chunk: Buffer, encoding: BufferEncoding, next: (error?: Error | null) => void): Promise<void> {
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