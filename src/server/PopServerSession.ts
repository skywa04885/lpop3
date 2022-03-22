import { English } from "../languages/English";
import { Language } from "../languages/Language";
import { PopMessage } from "../shared/PopMessage";
import { PopSession, PopSessionState } from "../shared/PopSession";
import { PopUser } from "../shared/PopUser";

export const DEFAULT_POP_SERVER_STATE_TYPE: PopSessionState = PopSessionState.Authorization;

export class PopServerSession extends PopSession {
    public user: PopUser | null;
    public messages: PopMessage[] | null;

    public constructor(public language: Language) {
        super(DEFAULT_POP_SERVER_STATE_TYPE);
        this.user = null;
        this.messages = null;
    }
}