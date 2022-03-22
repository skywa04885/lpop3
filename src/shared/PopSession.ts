export enum PopSessionState {
    Authorization = 0,
    Transaction = 1,
}

export class PopSession {
    public constructor(public state: PopSessionState) { }
}
