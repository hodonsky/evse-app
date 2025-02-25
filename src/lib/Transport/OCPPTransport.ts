"use strict"

import { randomBytes } from "crypto"
import { connect as tlsConnect } from "tls"
import { connect as netConnect } from "net"
import EventsObject from "../EventsObject"

import { ICentralSystemService, IPayload, IOCPPTransport, IOCPPTransportOptions } from "./interfaces"
import { EEvent, ETransportType, EReconnectStrategy, EWebSocketProtocol} from "./enums"

import { CallEnvelope, ResponseEnvelope, parseWebSocketFrame } from "./Envelope"

export class OCPPTransport extends EventsObject implements IOCPPTransport {
  events: EEvent[] = Object.values( EEvent )
  centralSystemService:ICentralSystemService = {
    type: ETransportType.OCPP1_6J,
    host: "localhost",
    port: 80,
    path: "/",
    protocol: EWebSocketProtocol.WS,
    reconnect: {
      strategy: EReconnectStrategy.LINEAR,
      timeout : 3000,
      attempts: 10
    }
  }
  #link:any
  #linkError:Error|undefined
  #reconnectCount:number = 0
  constructor( options: IOCPPTransportOptions ) {
    super()
    this.events = options.events ? options.events : this.events;

    this.centralSystemService = {
      ...options.centralSystemService,
      tls: { 
        ...this.centralSystemService.tls,
        ...options.centralSystemService.tls
      },
      ftp: {
        ...this.centralSystemService.ftp,
        ...options.centralSystemService.ftp
      },
      reconnect: {
        ...this.centralSystemService.reconnect,
        ...options.centralSystemService.reconnect
      }
    }
  }
  async connect(): Promise<void> {
    const { host, port, path, protocol, tls }:ICentralSystemService = this.centralSystemService
    if ( !host || !port || !path ){
      throw new SyntaxError("Cannot connect without options.centralSystemService[host|port|path]")
    }
    return new Promise( ( resolve, reject ) => {
      const connectCallback = async () => {
        console.log(`${tls?.enabled ? "🔒 Securely" :""} connected to server`);
        this.#link.write([
            `GET ${path} HTTP/1.1`,
            `Host: ${host}:${port} `,
            `Upgrade: websocket`,
            `Connection: Upgrade`,
            `Sec-WebSocket-Key: ${randomBytes(16).toString('base64')}`,
            `Sec-WebSocket-Version: 13`,
            `Sec-Websocket-Protocol: ${this.centralSystemService.type}`
          ]
          .map( header => Buffer.from(header, 'ascii').toString('ascii') )
          .join('\r\n') + '\r\n\r\n' 
        )
        this.#reconnectCount = 0
        this.#linkError = undefined
        resolve()
      }
      console.log(`wss://${host}:${port}${path}`)
      const connectOptions = {
        host, port
      }, tlsConnectOptions = {
        ...connectOptions,
        protocol, ca: tls?.ca,
        rejectUnauthorized: true,
        keepAlive: true
      }
      this.#link = !tls?.enabled
                    ? netConnect( connectOptions, connectCallback)
                    : tlsConnect( tlsConnectOptions, connectCallback )
      
      this.#link.on('data', ( data: any ) => {
        //console.log('📥 Received from server[data:RAW]')
        let event
        const frameData = parseWebSocketFrame( data )
        try {
          event = JSON.parse( frameData as string )
        } catch( e ) {
          // TODO: clean up non-text frames
          // console.warn( e )
          // event = frameData
        }
        this.emit( "OCPP_EVENT", event )
      })
      this.#link.on( "end", ( ...args:any ) => {
        console.info("END", ...args )
      })
      this.#link.on( "close", async ( ...args:any ) => {
        console.info( "close", ...args )

        if ( this.#linkError?.message?.includes( "connect EHOSTUNREACH" ) ){
          this.#link = undefined
          this.reconnect()
          return
        } else {
          setTimeout(this.reconnect, this.centralSystemService?.reconnect?.timeout || 30000 )
        }
        
        reject()
      })
      this.#link.on( "error", ( err:Error ) => {
        console.error( err );
        this.#linkError = err
      })
    })
  }

  async disconnect(): Promise<void> {
    // Implement disconnect logic here
  }

  async reconnect(): Promise<void> {
    // Implement strategy
    if ( !this.centralSystemService.reconnect ){
      throw new SyntaxError( "Reconnects not defined" )
    }
    if ( this.#reconnectCount > this.centralSystemService.reconnect.attempts! ){
      throw new Error("Max Reconnects")
    }
    this.#reconnectCount = this.#reconnectCount + 1
    console.log( `Reconnect Attempt with strategy[${this.centralSystemService.reconnect.strategy}]: ${this.#reconnectCount} of ${this.centralSystemService.reconnect.attempts}`)
    await this.connect()
  }
  resetRetries():void {
    //clear reconnect variables (soft reset)
  }

  isConnected(){
    return !!this.#link
  }
  async sendMessage( method: string, payload?: IPayload ): Promise<void> {
    if ( !this.#link ) {
      throw `Cannot send message[ method: ${method}, payload: ${JSON.stringify(payload)}], not connected to Central System Service`
    }
    const { message } = new CallEnvelope( method, payload )
    await this.#link.write( message )
  }
  async sendResponse( messageId: string, payload: IPayload ): Promise<void>{
    if ( !this.#link ) {
      throw `Cannot send response[ Id: ${messageId}, payload: ${JSON.stringify(payload)}], not connected to Central System Service`
    }
    const { message } = new ResponseEnvelope( messageId, payload )
    await this.#link.write( message )
  }
}
export default OCPPTransport