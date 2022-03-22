import { English } from "../languages/English";
import { Language } from "../languages/Language";
import { PopBanner } from "../shared/PopBanner";
import { PopMessage } from "../shared/PopMessage";
import { PopSession, PopSessionState } from "../shared/PopSession";
import { PopUser } from "../shared/PopUser";

export const DEFAULT_POP_SERVER_STATE_TYPE: PopSessionState = PopSessionState.Authorization;

export class PopServerSession extends PopSession {
    public user: PopUser | null;
    public invalid_command_count: number;
    public messages: PopMessage[] | null;
    public banner: PopBanner;

    public constructor(public language: Language) {
        super(DEFAULT_POP_SERVER_STATE_TYPE);
        this.user = null;
        this.messages = null;
        this.invalid_command_count = 0;
        this.banner = new PopBanner();
    }

    /**
     * Gets the total size of all messages.
     */
    public get messages_size_sum(): number {
        let total_size: number = 0;
        this.messages?.forEach((message: PopMessage) => {
            total_size += message.size;
        });
        return total_size;
    }
}