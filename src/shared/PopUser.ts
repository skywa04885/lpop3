export class PopUser {
    /**
     * Constructs a new PopUser.
     * @param user the user.
     * @param pass the password.
     */
    public constructor(public readonly user: string, public readonly pass: string) { }

    /**
     * Gets the plain password.
     */
    public get pass_plain(): string {
        return this.pass;
    }
}