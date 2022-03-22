import os from 'os';

export class PopBanner {
    /**
     * Constructs a new PopBanner.
     * @param rand the random data.
     * @param hostname the hostname.
     */
    public constructor (public readonly rand: string = Date.now().toString(), public readonly hostname: string = os.hostname()) { }

    /**
     * Encodes the current PopBanner.
     * @returns the encoded version.
     */
    public encode(): string {
        return `<${this.rand}@${this.hostname}>`
    }

    /**
     * Decodes the given banner.
     * @param raw the raw banner.
     * @returns the decoded banner.
     */
    public static decode(raw: string): PopBanner {
        // Makes sure the end and start are correct.
        if (!raw.startsWith('<') || !raw.endsWith('>')) {
            throw new Error('Missing brackets in pop baner.');
        }

        // Gets the substring without brackets.
        raw = raw.substring(1, raw.length - 1);

        // Gets the random string and hostname.
        if (!raw.includes('@')) {
            throw new Error('Missing @');
        }

        let [ rand, hostname ] = raw.split('@');
        rand = rand.trim();
        hostname = hostname.trim();

        // Makes sure neither are empty.
        if (rand.length === 0 || hostname.length === 0) {
            throw new Error('The hostname and random string must be larger than one.');
        }

        // Constructs and returns the pop banner.
        return new PopBanner(rand, hostname);
    }
}