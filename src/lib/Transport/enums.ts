"use strict"

export enum EEvent {
  BOOT_NOTIFICATION        = "BootNotification",
  STATUS_NOTIFICATION      = "StatusNotification",
  TRANSACTION_START        = "TransactionStart",
  TRANSACTION_STOP         = "TransactionStop",
  GET_DIAGNOSTICS          = "GetDiagnostics",
  CHANGE_AVAILABILITY      = "ChangeAvailability",
  REMOTE_START_TRANSACTION = "RemoteStartTransaction",
  REMOTE_STOP_TRANSACTION  = "RemoteStopTransaction"
}
export enum EReconnectStrategy {
  "LINEAR"      = "linear",
  "PROGRESSIVE" = "progressive",
  "FIBONACCI"   = "fibonacci"
}
export enum ETransportType {
  "OCPP1_6J"  = "ocpp1.6",
  "OCPP2_0_1" = "ocpp2.0.1"
}
export enum EWebSocketProtocol {
  "WS"  = "ws",
  "WSS" = "wss"
}
export enum EFTPProtocol {
  "FTP"  = "ftp",
  "FTPS" = "ftps"
}
export enum ETLSVersions {
  "TLSv1"   = "TLSv1",
  "TLSv1_2" = "TLSv1.2",
  "TLSv1_3" = "TLSv1.3"
}