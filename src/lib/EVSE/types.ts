"use strict"

import { IEVSE, IPayload } from "./interfaces"

export type TEVSE = IEVSE & { 
  emitEvent(method:string, payload?: IPayload ):void;
  remoteStartTransaction( idTag: string, connectorId: number ):Promise<void>
}