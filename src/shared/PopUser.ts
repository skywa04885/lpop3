export class PopUser {
    /**
     * Constructs a new PopUser.
     * @param user the user.
     * @param pass the password.
     * @param secret the secret.
     * @param udata the user data.
     */
    public constructor(public user: string, public pass: string, public secret: string | null = null, public udata: any = null) { }

    /**
     * Gets the plain password.
     */
    public get pass_plain(): string {
        return this.pass;
    }
}