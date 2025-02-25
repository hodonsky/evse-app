"use strict"

import { Readable } from "stream"
import FTPTransport from "./FTPTransport"
import SFTPTransport from "./SFTPTransport"
import OCPPTransport from "./OCPPTransport"
import {
  EEvent,
  EFTPProtocol,
  EReconnectStrategy,
  ETransportType,
  ETLSVersions,
  EWebSocketProtocol
} from "./enums"


export interface IPayload {
  [key: string]: any;
  timestamp?: string;
}
export interface IEnvelope {
  id     : string;
  message: Buffer;
}
export interface ITLSConfiguration {
  enabled   ?: boolean,
  minVersion?: ETLSVersions,
  ca        ?: string | Array<string> | Buffer<ArrayBufferLike> | undefined,
  key       ?: string | Array<string> | Array<Readable> | Readable | undefined,
  cert      ?: string | Array<string> | Array<Readable> | Readable | undefined 
}
export interface IFTPConfiguration {
  protocol?: EFTPProtocol;
  username?: string;
  password?: string;
}

export interface IReconnectConfiguration {
  strategy?: EReconnectStrategy;
  timeout ?: number;
  attempts?: number;
}

export interface ICentralSystemService {
  type     : ETransportType;
  host     ?: string;
  port     ?: number;
  path     ?: string;
  protocol ?: EWebSocketProtocol;
  identity ?: string;
  password ?: string;
  tls      ?: ITLSConfiguration;
  ftp      ?: IFTPConfiguration;
  reconnect?: IReconnectConfiguration;
}

export interface IOCPPTransportOptions {
  events: EEvent[];
  centralSystemService: ICentralSystemService;
}

export interface IOCPPTransport {
  events: EEvent[];
  centralSystemService: ICentralSystemService;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(method: string, payload: IPayload | undefined, messageId?: string ): Promise<void>;
  isConnected():boolean;
}
export interface IFTPTransportOptions {
  host   : string;
  port  ?: string | number;
  user  ?: string;
  pass  ?: string;
  pasv  ?: boolean;
  secure?: boolean;
}

export interface IFTPTransport {
  uri:string;
  connect():void;
  uploadFile(localPath:string, remotePath:string):Promise<{path:string}|void>;
  end():void;
}

export type Transport = OCPPTransport | FTPTransport | SFTPTransport