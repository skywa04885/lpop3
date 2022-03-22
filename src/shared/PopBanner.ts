import os from 'os';

export class PopBanner {
    /**
     * Constructs a new PopBanner.
     * @param timestamp the timestamp.
     * @param hostname the hostname.
     */
    public constructor (public readonly timestamp: number = Date.now(), public readonly hostname: string = os.hostname()) { }

    /**
     * Encodes the current PopBanner.
     * @returns the encoded version.
     */
    public encode(): string {
        return `<${this.timestamp}@${this.hostname}>`
    }
}