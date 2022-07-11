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

import net from "net";
import {EventEmitter} from "stream";
import tls from "tls";

export class PopSocket extends EventEmitter {
  /**
   * Constructs a new PopSocket.
   * @param secure if the socket is secure.
   * @param socket the socket.
   */
  public constructor(
    public readonly secure: boolean,
    public readonly socket: net.Socket | tls.TLSSocket
  ) {
    super();

    if (secure) {
      const socket: tls.TLSSocket = this.socket as tls.TLSSocket;

      socket.on("close", () => this._event_close(false));
      socket.on("data", (data: Buffer) => this._event_data(data));
      socket.on("drain", () => this._event_drain()); // Not sure if this is supported!
      socket.on("end", () => this._event_end());
      socket.on("error", (err: Error) => this._event_error(err));
      socket.on("timeout", () => this._event_timeout());
    } else {
      const socket: net.Socket = this.socket as net.Socket;

      socket.on("close", (had_error: boolean) => this._event_close(had_error));
      socket.on("data", (data: Buffer) => this._event_data(data));
      socket.on("drain", () => this._event_drain());
      socket.on("end", () => this._event_end());
      socket.on("error", (err: Error) => this._event_error(err));
      socket.on("timeout", () => this._event_timeout());
      socket.on("connect", () => this._event_connect());
    }
  }

  /**
   * Gets the address string.
   */
  public get address(): string {
    if (!this.socket.remoteAddress) {
      throw new Error("Socket is not connected!");
    }

    return this.socket.remoteAddress;
  }

  /**
   * Gets the port.
   */
  public get port(): number {
    if (!this.socket.remotePort) {
      throw new Error("Socket is not connected!");
    }

    return this.socket.remotePort;
  }

  /**
   * Gets the socket family.
   */
  public get family(): string {
    if (!this.socket.remoteFamily) {
      throw new Error("Socket is not connected!");
    }

    return this.socket.remoteFamily;
  }

  /**
   * COnnects to the given host and port.
   * @param host the host.
   * @param port the port.
   * @param secure if it is secure.
   * @returns The PopSocket.
   */
  public static connect(
    host: string,
    port: number,
    secure: boolean
  ): Promise<PopSocket> {
    return new Promise<PopSocket>((resolve, reject) => {
      let socket: tls.TLSSocket | net.Socket;

      if (secure) {
        socket = tls.connect({
          host,
          port,
        });
      } else {
        socket = net.connect({
          host,
          port,
        });
      }

      socket.once("connect", () => resolve(new PopSocket(secure, socket)));
      socket.once("error", (err: Error) => reject(err));
    });
  }

  /**
   * Closes the socket.
   */
  public close(): void {
    this.socket.end();
  }

  /**
   * Pauses.
   */
  public pause(): void {
    this.socket.pause();
  }

  /**
   * Resumes.
   */
  public resume(): void {
    this.socket.resume();
  }

  /**
   * Sets the socket timeout.
   * @param timeout the timeout.
   * @returns ourselves.
   */
  public set_timeout(timeout: number): PopSocket {
    this.socket.setTimeout(timeout);

    return this;
  }

  /**
   * Writes the given data to the socket.
   * @param data the data to write.
   * @returns All written.
   */
  public write(data: string): boolean {
    return this.socket.write(data);
  }

  /**
   * Gets called when the socket was closed.
   * @param had_error if there was an error (net only).
   */
  protected _event_close(had_error: boolean): void {
    this.emit("close", had_error);
  }

  /**
   * Gets called when there is data available.
   * @param data the data.
   */
  protected _event_data(data: Buffer): void {
    this.emit("data", data);
  }

  /**
   * Gets called when the write buffer is empty.
   */
  protected _event_drain(): void {
    this.emit("drain");
  }

  /**
   * Gets called when the other side wants to end.
   */
  protected _event_end(): void {
    this.emit("end");
  }

  /**
   * Gets called when an error occured.
   * @param err the error.
   */
  protected _event_error(err: Error): void {
    this.socket.destroy();

    this.emit("error", err);
  }

  /**
   * Gets called when an timeout occured.
   */
  protected _event_timeout(): void {
    this.socket.end();

    this.emit("timeout");
  }

  /**
   * Gets called when the socket is connected.
   */
  protected _event_connect(): void {
    this.emit("connect");
  }
}
