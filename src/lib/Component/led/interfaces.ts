"use strict"

import { ohms } from "../common/types"

export interface ILED {
  name       : string
  description: string
  pins       : number
  resistance : ohms
}