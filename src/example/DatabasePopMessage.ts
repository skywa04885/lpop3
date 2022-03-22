import { PopMessage } from "../shared/PopMessage";

export const DATABASE_POP_MESSAGE: string = 'X-Mailer: My Hands\r\n'
    + 'Subject: Test message\r\n'
    + 'From: test@test.com\r\n'
    + 'Date: Mon, 21 Mar 2022 09:55:42 +0000\r\n'
    + 'To: luke@test.com\r\n'
    + 'Message-ID: <asdadada@awa.com>\r\n'
    + 'Content-Type: text/plain\r\n'
    + '\r\n'
    + 'Hello world!\r\n'
    + '\r\n.\r\n.\r\n\r\n';

export class DatabasePopMessage extends PopMessage {

}