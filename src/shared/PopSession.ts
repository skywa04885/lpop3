export enum PopSessionState {
    Authorization = 'AUTHORIZATION',
    Transaction = 'TRANSACTION',
}

export class PopSession {
    public constructor(public state: PopSessionState) { }
}
