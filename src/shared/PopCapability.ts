import { SEGMENT_SEPARATOR } from "./Constants";

export enum PopCapabilityType {
    Implementation = 'IMPLEMENTATION',
    LoginDelay = 'LOGIN-DELAY',
    RespCodes = 'RESP-CODES',
    AuthRespCode = 'AUTH-RESP-CODE',
    Pipelining = 'PIPELINING',
    Sasl = 'SASL',
    User = 'USER',
    Top = 'TOP',
    Expire = 'EXPIRE',
    Uidl = 'UIDL',
    Stls = 'STLS',
    Utf8 = 'UTF8',
    Lang = 'LANG',
}

export class PopCapability {
    /**
     * Constructs a new pop capability.
     * @param type the type of cabability.
     * @param args the arguments.
     */
    public constructor(public readonly type: PopCapabilityType, public readonly args: string | string[] | null = null) { }

    /**
     * Encodes the capability.
     * @returns the encoded capability.
     */
    public encode(): string {
        let arr: string[] = [];

        arr.push(this.type);

        if (this.args !== null) {
            if (typeof (this.args) === 'string') {
                arr.push(this.args.trim());
            } else {
                arr = arr.concat(this.args);
            }    
        }

        return arr.join(SEGMENT_SEPARATOR);
    }
}
