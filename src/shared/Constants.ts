import { PopCapability, PopCapabilityType } from "./PopCapability";

export const LINE_SEPARATOR: string = '\r\n';
export const SEGMENT_SEPARATOR: string = ' ';
export const CAPABILITIES: PopCapability[] = [
    new PopCapability(PopCapabilityType.Implementation, 'Luke POP3/POP3S Server, maintainer: luke.rieff@gmail.com'),
    new PopCapability(PopCapabilityType.LoginDelay, '0'),
    new PopCapability(PopCapabilityType.User),
    new PopCapability(PopCapabilityType.Uidl),
    new PopCapability(PopCapabilityType.Utf8),
    new PopCapability(PopCapabilityType.Expire, 'NEVER')
];
