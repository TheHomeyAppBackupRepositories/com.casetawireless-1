import TypedEmitter from 'typed-emitter';
declare type BridgeFinderEvents = {
    discovered: (bridgeInfo: BridgeNetInfo) => void;
    failed: (error: Error) => void;
};
export declare type BridgeNetInfo = {
    bridgeid: string;
    ipAddr: string;
    systype?: string;
};
declare const BridgeFinder_base: new () => TypedEmitter<BridgeFinderEvents>;
export declare class BridgeFinder extends BridgeFinder_base {
    private discovery?;
    constructor();
    beginSearching(): void;
    private handleDiscovery;
    destroy(): void;
    private extractIp;
    private getBridgeID;
}
export {};
//# sourceMappingURL=BridgeFinder.d.ts.map