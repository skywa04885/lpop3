import { PopBanner } from "./PopBanner";
import crypto from 'crypto';

export class ApopDigest {
    /**
     * Generates the APOP digest.
     * @param banner the banner.
     * @param secret the secret.
     * @returns The digest.
     */
    public static generate(banner: PopBanner, secret: string): string {
        // Generates the predigest string.
        const predigest_string: string = `${banner.encode()}${secret}`;

        // Creates the hash.
        let hash: crypto.Hash = crypto.createHash('md5');
        hash.update(predigest_string);

        // Returns the digest.
        return hash.digest('hex');
    }
}
