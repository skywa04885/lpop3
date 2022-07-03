export enum PopMessageFlag {
    Delete = (1 << 0)
}

export class PopMessage {
    public constructor(public readonly uid: string | number, public readonly size: number, protected _contents: string | null = null, public flags: number = 0) { }

    /**
     * To prevent huge memory usage, each message is lazy loaded.
     * 
     * @returns the contents.
     */
    public async load_contents(): Promise<string> {
        return 'Not implemented!';
    }

    /**
     * Gets the UID as a string, even if it's a number.
     */
    public get uid_string(): string {
        if (typeof (this.uid) === 'string') {
            return this.uid;
        }
        
        return this.uid.toString();
    }

    /**
     * Gets the contents of the message.
     * @returns the contents.
     */
    public async contents(): Promise<string> {
        if (!this._contents) {
            this._contents = await this.load_contents();
        }

        return this._contents as string;
    }
}
