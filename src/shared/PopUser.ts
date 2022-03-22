export class PopUser {
    /**
     * Constructs a new PopUser.
     * @param user the user.
     * @param pass the password.
     */
    public constructor(public user: string | null = null, public pass: string | null = null) { }

    /**
     * Gets the plain password.
     */
    public get pass_plain(): string {
        if (this.pass === null) {
            throw new Error('There is no pasword available.');
        }

        return this.pass;
    }

    /**
     * Checks if the PopUser is empty.
     */
    public get empty(): boolean {
        return this.pass === null && this.user === null;
    }
    
    /**
     * Clears the values.
     * @returns ourselves.
     */
    public clear(): PopUser {
        this.user = null;
        this.pass = null;
        return this;
    }
}