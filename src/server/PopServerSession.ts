import { English } from "../languages/English";
import { Language } from "../languages/Language";
import { PopBanner } from "../shared/PopBanner";
import { PopMessage, PopMessageFlag } from "../shared/PopMessage";
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
    public get available_messages_size_sum(): number {
        let total_size: number = 0;
        this.messages?.forEach((message: PopMessage) => {
            if ((message.flags & PopMessageFlag.Delete) !== 0) {
                return;
            }

            total_size += message.size;
        });
        return total_size;
    }

    /**
     * Gets all the messages which are not deleted.
     * @returns the available messages which are not deleted.
     */
    public get available_messages(): PopMessage[] {
        if (!this.messages) {
            throw new Error('There are no messages to filter.');
        }

        return this.messages.filter((message: PopMessage): boolean => {
            return (message.flags & PopMessageFlag.Delete) === 0;
        });
    }

    /**
     * Gets the number of available messages.
     * @returns the number of available messages.
     */
    public get available_message_count(): number {
        if (!this.messages) {
            throw new Error('There are no messages to count.');
        }

        let result: number = 0;

        this.messages.forEach((message: PopMessage): void => {
            if ((message.flags & PopMessageFlag.Delete) === 0) {
                ++result;
            }
        });

        return result;
    }
}