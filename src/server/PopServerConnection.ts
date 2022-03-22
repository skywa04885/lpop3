import { EventEmitter } from "stream";
import { CAPABILITIES } from "../shared/Constants";
import { PopCommand, PopCommandType } from "../shared/PopCommand";
import { PopMultilineResponse } from "../shared/PopMultilineResponse";
import { PopResponse, PopResponseType } from "../shared/PopResponse";
import { PopSegmentedReader } from "../shared/PopSegmentedReader";
import { PopSession } from "../shared/PopSession";
import { PopSocket } from "../shared/PopSocket";
import { PopServerSession } from "./PopServerSession";

export class PopServerConnection extends EventEmitter {
    protected segmented_reader: PopSegmentedReader;
    protected session: PopServerSession;

    /**
     * Constructs a new PopServerConnection.
     * @param pop_sock the socket.
     */
    public constructor(public readonly pop_sock: PopSocket) {
        super();

        this.segmented_reader = new PopSegmentedReader();
        this.session = new PopServerSession();
    }

    /**
     * Begins the server connection (listens and sends initial line).
     * @returns ourselves.
     */
    public begin(): PopServerConnection {
        this.segmented_reader.on('segment' , (line: string) => this._segmented_reader_event_line(line));
        
        this.pop_sock.on('close', (had_error: boolean) => this._event_close(had_error));
        this.pop_sock.on('data', (data: Buffer) => this._event_data(data));

        this.pop_sock.write(new PopResponse(PopResponseType.Success, `Luke-${this.pop_sock.secure ? 'POP3S' : 'POP3'} at your service, ${this.pop_sock.family} ${this.pop_sock.address}:${this.pop_sock.port}`).encode(true));

        return this;
    }

    /**
     * Gets called when the socket closed.
     * @param had_error if there was an error (net-only).
     */
    protected _event_close(had_error: boolean): void {
    }

    /**
     * Gets called when there is data available.
     * @param data the data.
     */
    protected _event_data(data: Buffer): void {
        this.segmented_reader.write(data.toString('utf-8'));
    }

    /**
     * Gets called when there is a new line.
     * @param line the line available for reading.
     */
    protected _segmented_reader_event_line(line: string): void {
        try {
            const command: PopCommand = PopCommand.decode(line);

            switch (command.type) {
                case PopCommandType.Capa:
                    this._handle_capa();
                    break;
            }
        } catch (e) {
            this.pop_sock.write(new PopResponse(PopResponseType.Failure, (e as Error).message).encode(true));
            return;
        }
    }

    /**
     * Handles the capability command.
     */
    protected _handle_capa(): void {
        this.pop_sock.write(new PopResponse(PopResponseType.Success, 'capabilities follow.').encode(true));
        this.pop_sock.write(new PopMultilineResponse(CAPABILITIES.map(function (capability) {
            return capability.encode();
        })).encode(true));
    }
}