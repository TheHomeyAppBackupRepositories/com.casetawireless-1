import { MessageBodyType, BodyType } from './MessageBodyTypes';
export declare type CommuniqueType = 'CreateRequest' | 'CreateResponse' | 'DeleteRequest' | 'DeleteResponse' | 'ExceptionResponse' | 'MetadataRequest' | 'MetadataResponse' | 'ReadRequest' | 'ReadResponse' | 'SubscribeRequest' | 'SubscribeResponse' | 'UnsubscribeRequest' | 'UnsubscribeResponse' | 'UpdateRequest' | 'UpdateResponse';
export interface ResponseHeaderJSON {
    MessageBodyType?: string;
    StatusCode?: string;
    Url?: string;
    ClientTag?: string;
}
export declare class ResponseHeader {
    StatusCode?: ResponseStatus;
    Url?: string;
    MessageBodyType?: MessageBodyType;
    ClientTag?: string;
    static fromJSON(json?: ResponseHeaderJSON): ResponseHeader;
}
export interface ResponseJSON {
    CommuniqueType: CommuniqueType;
    Header: ResponseHeaderJSON;
    Body: object;
}
export declare class Response {
    CommuniqueType?: CommuniqueType;
    Body?: BodyType;
    Header: ResponseHeader;
    constructor();
    static fromJSON(json: ResponseJSON): Response;
}
export declare type ResponseWithTag = {
    response: Response;
    tag: string;
};
export declare class ResponseStatus {
    message: string;
    code?: number | undefined;
    constructor(message: string, code?: number | undefined);
    static fromString(s: string): ResponseStatus;
    toJSON(): string;
    isSuccessful(): boolean;
}
//# sourceMappingURL=Messages.d.ts.map