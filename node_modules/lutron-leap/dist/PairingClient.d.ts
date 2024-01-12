import TypedEmitter from 'typed-emitter';
declare type PairingEvents = {
    message: (response: object) => void;
    disconnected: () => void;
};
declare const PairingClient_base: new () => TypedEmitter<PairingEvents>;
export declare class PairingClient extends PairingClient_base {
    private readonly host;
    private readonly port;
    private connected;
    private socket?;
    private readonly tlsOptions;
    private buffer;
    constructor(host: string, port: number);
    connect(): Promise<void>;
    requestPair(csrText: string): Promise<void>;
    private socketDataHandler;
}
export {};
//# sourceMappingURL=PairingClient.d.ts.map