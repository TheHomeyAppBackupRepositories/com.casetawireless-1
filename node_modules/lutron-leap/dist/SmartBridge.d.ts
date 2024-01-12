import { LeapClient } from './LeapClient';
import { Response } from './Messages';
import { BodyType, ButtonDefinition, ButtonGroupDefinition, DeviceDefinition, ExceptionDetail, Href, MultipleOccupancyGroupStatus } from './MessageBodyTypes';
import TypedEmitter from 'typed-emitter';
export declare const LEAP_PORT = 8081;
export interface BridgeInfo {
    firmwareRevision: string;
    manufacturer: string;
    model: string;
    name: string;
    serialNumber: string;
}
declare type SmartBridgeEvents = {
    unsolicited: (bridgeID: string, response: Response) => void;
    disconnected: () => void;
};
declare const SmartBridge_base: new () => TypedEmitter<SmartBridgeEvents>;
export declare class SmartBridge extends SmartBridge_base {
    readonly bridgeID: string;
    client: LeapClient;
    private pingLooper;
    constructor(bridgeID: string, client: LeapClient);
    private startPingLoop;
    start(): void;
    close(): void;
    ping(): Promise<Response>;
    getHref(href: Href): Promise<BodyType>;
    getBridgeInfo(): Promise<BridgeInfo>;
    getDeviceInfo(): Promise<DeviceDefinition[]>;
    setBlindsTilt(device: DeviceDefinition, value: number): Promise<void>;
    readBlindsTilt(device: DeviceDefinition): Promise<number>;
    getButtonGroupsFromDevice(device: DeviceDefinition): Promise<(ButtonGroupDefinition | ExceptionDetail)[]>;
    getButtonsFromGroup(bgroup: ButtonGroupDefinition): Promise<ButtonDefinition[]>;
    subscribeToButton(button: ButtonDefinition, cb: (r: Response) => void): void;
    subscribeToOccupancy(cb: (r: Response) => void): Promise<MultipleOccupancyGroupStatus>;
    private _handleUnsolicited;
    private _handleDisconnect;
}
export {};
//# sourceMappingURL=SmartBridge.d.ts.map