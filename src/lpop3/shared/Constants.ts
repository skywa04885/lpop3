/*
    Copyright 2022 Luke A.C.A. Rieff (Skywa04885)

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import {PopCapability, PopCapabilityType} from "./PopCapability";

export const LINE_SEPARATOR: string = "\r\n";
export const SEGMENT_SEPARATOR: string = " ";
export const CAPABILITIES: PopCapability[] = [
  new PopCapability(
    PopCapabilityType.Implementation,
    "Luke POP3/POP3S Server, maintainer: luke.rieff@gmail.com"
  ),
  new PopCapability(PopCapabilityType.LoginDelay, "0"),
  new PopCapability(PopCapabilityType.User),
  new PopCapability(PopCapabilityType.Uidl),
  new PopCapability(PopCapabilityType.Utf8),
  new PopCapability(PopCapabilityType.Expire, "NEVER"),
  new PopCapability(PopCapabilityType.Lang),
  new PopCapability(PopCapabilityType.Pipelining),
  new PopCapability(PopCapabilityType.Top),
];
export const MAX_INVALID_COMMANDS: number = 10;
