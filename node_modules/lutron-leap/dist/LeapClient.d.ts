/// <reference types="node" />
import * as fs from 'fs';
import { CommuniqueType, Response, ResponseWithTag } from './Messages';
import { BodyType, Href, PingResponseDefinition, ClientSettingDefinition, ExceptionDetail } from './MessageBodyTypes';
import TypedEmitter from 'typed-emitter';
export interface Message {
    CommuniqueType: CommuniqueType;
    Header: {
        ClientTag: string;
        Url: string;
    };
    Body?: Record<string, unknown>;
}
declare type LeapClientEvents = {
    unsolicited: (response: Response) => void;
    disconnected: () => void;
};
declare const LeapClient_base: new () => TypedEmitter<LeapClientEvents>;
export declare class LeapClient extends LeapClient_base {
    private readonly host;
    private readonly port;
    private connected;
    private socket?;
    private readonly tlsOptions;
    private inFlightRequests;
    private taggedSubscriptions;
    private responseParser;
    private sslKeylogFile?;
    constructor(host: string, port: number, ca: string, key: string, cert: string, sslKeylogFile?: fs.WriteStream);
    retrieve<T extends BodyType>(href: Href, endpoint?: string): Promise<T>;
    request(communiqueType: CommuniqueType, url: string, body?: Record<string, unknown>, tag?: string): Promise<Response>;
    connect(): Promise<void>;
    close(): void;
    subscribe(url: string, callback: (resp: Response) => void, communiqueType?: CommuniqueType | undefined, body?: Record<string, unknown>, tag?: string): Promise<ResponseWithTag>;
    private _empty;
    private _onConnect;
    private socketDataHandler;
    private _handleResponse;
    setVersion(): Promise<ExceptionDetail | ClientSettingDefinition>;
    ping(): Promise<PingResponseDefinition>;
}
export {};
//# sourceMappingURL=LeapClient.d.ts.map