"use strict"
import { parseString, Builder } from "xml2js"
//import { SerialPort, ReadlineParser } from "serialport"
import { lstatSync, readFileSync, readdirSync } from "fs"

export class ErrorMalformedMessage extends Error {
  cause: string
  constructor( cause:string = "" ) {
    super( `Message Malformed: `)
    this.cause = cause
  }
}
export class StatusTransitionError extends Error {
  cause: string
  constructor( oldStatus:string, newStatus:string ){
    super( `Status Transition Error: Status[${oldStatus}] cannot transition to Status[${newStatus}]`)
    this.cause =  "NewStatus !== OldStatus"
  }
}

/**
 * Sends a command to the Arduino to control a device (e.g., a relay) by serial number.
 * @param {string} portPath - Port path such as: /dev/ttyUSB0
 * @param {Object} {command, serialNumber, portPath, baudRate, timeout, newLine } - The port path, baud rate, serial number of the device to target.
 * @returns {Promise<boolean>} Resolves to true if the command is sent successfully.
 */
// export async function sendSerialCommand( portPath:string, { command, serialNumber, baudRate = 9600, timeout = 2000, newLine = "\n" }:{ command:string,serialNumber:string|number|Symbol, baudRate?:number, timeout?:number, newLine?:string } ):Promise<boolean|string> {
//   const
//     sn = serialNumber instanceof Symbol ? serialNumber.description : serialNumber,
//     port = new SerialPort( { path: portPath, baudRate } ),
//     parser = new ReadlineParser({ delimiter: newLine }),
//     message = JSON.stringify( { serialNumber: sn, command } ) + newLine // Add newline for serial parsing
//   return new Promise( ( resolve, reject ) => {
//     const
//       time_out = setTimeout( () => ( reject(), port.close() ), timeout ),
//       wrapUp = ( msg?:string|boolean, err?:Error ) => (
//         clearTimeout( time_out ),
//         port.close(),
//         msg ? resolve( msg ) : err ? reject( err ) : false
//       )
//     parser.on( "data", ( data:string ) => wrapUp( data.trim() ) )
//     port.on( "error", ( err: Error ) => wrapUp( undefined, err ) )
//     port.on( "open", () => {
//       console.debug( `Port ${portPath} opened. Sending command: ${message}` )
//       port.write( message, ( err: Error | null | undefined ) => err ? wrapUp( undefined, err ) : true )
//     })
//   })
// }



// Lightweight XML Parser for ISO15118
export const ISO15118XMLParser = {
  // Parse XML string to JavaScript object
  parseXML: async ( xmlString:string ):Promise<any> => 
    new Promise((resolve, reject) => {
      parseString(
        xmlString,
        { explicitArray: false, trim: true, mergeAttrs: true },
        ( err:Error|null, result:any ) => err ? reject( err ) : resolve( result )
      )
    }),
  // Serialize JavaScript object to XML string
  buildXML: (jsObject:object, rootName:string = 'Root'):string =>
    (new Builder({
      rootName,
      xmldec: { version: '1.0', encoding: 'UTF-8', standalone: true },
    })).buildObject(jsObject),
  // Custom ISO15118-specific validation
  isISO15118Structure: ( parsedObj:any ):boolean => parsedObj && parsedObj['ISO15118Message']
}

export const readDeviceTree = ( nodePath:string , fullPath?: string ):any =>
  readdirSync( nodePath ).reduce( ( tree: any, node:any ) => (
    fullPath = `${nodePath}/${node}`,
    tree[ node ] = lstatSync( fullPath ).isDirectory() ? readDeviceTree( fullPath ) : readFileSync( fullPath, 'utf8' ),
    tree
  ), {} as any)