
import { randomBytes } from "crypto"
import { v4 as uuidv4 } from "uuid"
import { ErrorMalformedMessage } from "../utils"
import { IPayload, IEnvelope } from "./interfaces"

const createWebSocketFrame = (message:string, opcode:number = 0x1 ):Buffer => {
  const payload = Buffer.from(message, "utf-8");
  const mask = randomBytes(4);
  const maskedPayload = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i++) {
    maskedPayload[i] = payload[i] ^ mask[i % 4];
  }

  // Handle different payload lengths (up to 125, 126, 127 bytes)
  let frameHeader;
  if (payload.length <= 125) {
    frameHeader = Buffer.alloc(2 + 4); // 2 bytes for header + 4 bytes for mask
    frameHeader[1] = payload.length | 0x80; // Set masked bit
  } else if (payload.length <= 0xFFFF) {
    frameHeader = Buffer.alloc(4 + 4); // 4 bytes for extended payload length + 4 for mask
    frameHeader[1] = 126 | 0x80; // Set masked bit and 126 for extended length
    frameHeader.writeUInt16BE(payload.length, 2); // Write extended payload length
  } else {
    frameHeader = Buffer.alloc(10 + 4); // 10 bytes for long extended payload + 4 for mask
    frameHeader[1] = 127 | 0x80; // Set masked bit and 127 for long length
    frameHeader.writeBigUInt64BE(BigInt(payload.length), 2); // Write extended payload length (64-bit)
  }

  frameHeader[0] = opcode | 0x80; // Set FIN bit and opcode
  mask.copy(frameHeader, frameHeader.length - 4); // Copy mask
  return Buffer.concat([frameHeader, maskedPayload]);
}

// Frame handler for receiving WebSocket frames
export const parseWebSocketFrame = (frame: Buffer):string|void => {
  const firstByte = frame[0];
  const fin = (firstByte & 0x80) !== 0; // FIN bit
  const opcode = firstByte & 0x0f; // Extract opcode (lower 4 bits)

  const secondByte = frame[1];
  const isMasked = (secondByte & 0x80) !== 0; // Masked bit
  let payloadLength = secondByte & 0x7f; // Payload length (lower 7 bits)

  let offset = 2;
  if (payloadLength === 126) {
    payloadLength = frame.readUInt16BE(2); // Extended 16-bit payload length
    offset += 2;
  } else if (payloadLength === 127) {
    payloadLength = Number(frame.readBigUInt64BE(2)); // Extended 64-bit payload length
    offset += 8;
  }

  // Handle masking
  let mask;
  if (isMasked) {
    mask = frame.slice(offset, offset + 4); // Read the 4-byte mask
    offset += 4;
  }

  const payload = Buffer.alloc(payloadLength);
  for (let i = 0; i < payloadLength; i++) {
    payload[i] = frame[offset + i] ^ (isMasked ? mask[i % 4] : 0); // Unmask if necessary
  }

  const message = payload.toString("utf-8");

  // Handle different opcodes
  switch ( opcode ) {
    case 0x0: console.log("Continuation frame:", message);break;
    case 0x1: return message;
    case 0x2: console.log("Binary frame");                break;
    case 0x8: console.log("Close frame");                 break;
    case 0x9: console.log("Ping frame");                  break;
    case 0xA: console.log("Pong frame");                  break;
    default:
      throw new ErrorMalformedMessage(`Unknown opcode: ${opcode}`);
  }
};

const formatOCPPMessage = ( method:string, payload:IPayload = {}, messageId = Math.random().toString(36).substring(2, 15) ):Buffer => {
  const messageArr:any = [
    2,
    messageId,
    method,
    payload
  ]
  try {
    if ( typeof messageArr !== "object" && !(messageArr instanceof Array) ) throw new ErrorMalformedMessage("must be of type 'object' and instance of Array. OCPP expects a list []")
    if ( messageArr.length !== 4 ) throw new ErrorMalformedMessage("message must be 4 items: [messageType, messageId, action, payload]")
    if ( typeof messageArr[ 0 ] !== "number" ) throw new ErrorMalformedMessage("message[0] must be of type 'number'")
    if ( typeof messageArr[ 1 ] !== "string") throw new ErrorMalformedMessage("message[1] must be of type 'string'")
    if ( typeof messageArr[ 2 ] !== "string" ) throw new ErrorMalformedMessage("message[2] must be of type 'string'")
  } catch ( e:any ) {
    console.error( e.message, e.cause )
  }
  return createWebSocketFrame( JSON.stringify( messageArr ) )
}

const formatOCPPResponse = ( messageId:string, payload:IPayload = {} ):Buffer => {
  const messageArr:any = [
    3,
    messageId,
    payload
  ]
  try {
    if ( typeof messageArr !== "object" && !(messageArr instanceof Array) ) throw new ErrorMalformedMessage("must be of type 'object' and instance of Array. OCPP expects a list []")
    if ( messageArr.length !== 3 ) throw new ErrorMalformedMessage("response must be 3 items: [messageType, messageId, payload]")
    if ( typeof messageArr[ 0 ] !== "number" ) throw new ErrorMalformedMessage("message[0] must be of type 'number'")
    if ( typeof messageArr[ 1 ] !== "string") throw new ErrorMalformedMessage("message[1] must be of type 'string'")
  } catch ( e:any ) {
    console.error( e.message, e.cause )
  }
  return createWebSocketFrame( JSON.stringify( messageArr ) )
}

export class CallEnvelope implements IEnvelope {  
  id:string = uuidv4()
  text:string
  message:Buffer
  constructor( method:string, payload:IPayload = { timestamp: new Date().toISOString() } ) {
    this.text = `[${method}]: ${JSON.stringify(payload)}`
    this.message = formatOCPPMessage( method, payload )
  }
}
export class ResponseEnvelope implements IEnvelope {
  id:string = uuidv4()
  text:string
  message:Buffer
  constructor( messageId:string, payload:IPayload = { timestamp: new Date().toISOString() } ) {
    this.id = messageId
    this.text = `[${messageId}]: ${JSON.stringify(payload)}`
    this.message = formatOCPPResponse( messageId, payload )
  }
}

// export class ErrorEnvelope implements IEnvelope {
//   id:string = uuidv4()
//   text:string
//   message:Buffer
//   constructor( messageId:string, payload:IPayload = { timestamp: new Date().toISOString() } ) {
//     this.id = messageId
//     this.error = new Error(`[${messageId}]: ${JSON.stringify(payload)}`)
//     this.message = formatOCPPError( messageId, payload )
//   }
// }