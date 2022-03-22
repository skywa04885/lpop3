import { PopSession, PopSessionState } from "../shared/PopSession";
import { PopUser } from "../shared/PopUser";

export const DEFAULT_POP_SERVER_STATE_TYPE: PopSessionState = PopSessionState.Authorization;

export class PopServerSession extends PopSession {
    public user: PopUser | null;

    public constructor() {
        super(DEFAULT_POP_SERVER_STATE_TYPE);
        this.user = null;
    }

    public reset() {
        this.state = DEFAULT_POP_SERVER_STATE_TYPE;
        this.user = null;
    }
}