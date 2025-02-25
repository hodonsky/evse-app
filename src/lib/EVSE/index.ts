"use strict"

import pkg from "../../../package.json"
import { readFileSync, statSync, writeFileSync, unlink } from "fs"
import { performance } from "perf_hooks"

import Logger from "../Logger"

import { TEVSE } from "./types"

import {
  IEVSEConfiguration,
  IEVSEEventsQueue,
  IEVSEOptions,
  IEVSEOSConfiguration,
  IEVSEManufacturerConfiguration,
  IComponentModules
} from "./interfaces"

import {
  EAvailability,
  EChargingScheduleAllowedChargingRateUnit,
  ECurrentLevel,
  EMeterType,
  EDiagnosticStatus,
  EEventsQueueDBType,
  ENetworkModeEVSE,
  EPowerType,
  EVoltageLevel,
  EPerfMarksFTPUpload,
  EPerfMeasuresFTPUpload
} from "./enums"

import { Base }                                       from "../Base"
import { EventsQueue }                                from "../Queue"
import { IEventsQueueOptions }                        from "../Queue/interfaces"
import { EVSEConnector }                              from  "../EVSEConnector"
import { EConnectorStatus }                           from "../EVSEConnector/enums"
import { OCPPTransport, FTPTransport, SFTPTransport } from "../Transport"
import { ETransportType, EEvent }                     from "../Transport/enums"
import { IPayload, Transport }                        from "../Transport/interfaces"

const logger = new Logger( /*{out:"./logs/ocpp_log.log"}*/ )

// TODO: Abstract Logger, and set in options of base objects
// TODO: Add output file, and file rotation to logging
const validateOptions = (options: any) => {
  switch( true ) {
    case !options.id && typeof options.id !== 'number': throw SyntaxError( "EVSEBase Constructor: Options argument is missing required property(id)" );
    case !options.serialNumber                        : throw SyntaxError( "EVSEBase Constructor: Options argument is missing required property(serialNumber)" );
    case options.connectors.length < 1                : console.warn( "Will not distribute power, no connectors registered")
      default: break
  }
}

export class EVSE extends Base implements TEVSE {
  availability: EAvailability = EAvailability.AVAILABLE;
  connectors: EVSEConnector[] = []
  voltage:EVoltageLevel = EVoltageLevel.AC_LEVEL_2_SINGLE_PHASE
  current:ECurrentLevel = ECurrentLevel.AC_LEVEL_2
  powerType:EPowerType = EPowerType.SPLIT_PHASE_AC
  meterValue:number = 0
  id: string | number
  vendorId: string | undefined
  model: string | undefined
  serialNumber: string
  lastHeartbeat: string | undefined
  location: string | undefined
  maxPower: number | undefined
  transport: Transport[] = []
  eventsQueue: IEVSEEventsQueue = {
    queue: null,
    dbType: EEventsQueueDBType.MEMORY,
    host: "",
    port: 0
  }
  configuration: IEVSEConfiguration = {
    allowOfflineTxForUnknownId       : true,
    authorizationCacheEnabled        : false,
    clockAlignedDataInterval         : 0,
    connectionTimeOut                : 100,// ms
    getConfigurationMaxKeys          : 128,
    heartbeatInterval                : 300000,// ms
    localAuthorizeOffline            : true,
    localPreAuthorize                : false,
    meterValuesAlignedData           : 0,
    meterValueSampleInterval         : 3000,//ms
    numberOfConnectors               : 2, 
    resetRetries                     : 10,
    stopTransactionOnEVSideDisconnect: true,
    stopTransactionOnInvalidId       : true
  }
  os: IEVSEOSConfiguration = {
    firmware: {
      version: pkg.version,
      downloadInterval: 300,  // Download interval in seconds
      downloadRetries: 10,    // Number of retries
    },
    logs:[
      //{ name: "OCPP_LOG", path: "./ocpp.log" }
    ],
    diagnostics: {
      status   : EDiagnosticStatus.NEVER ,
      timestamp: ""
    },
    temporaryDirectory: "/tmp"
  }
  manufacturer: IEVSEManufacturerConfiguration = {
    vendor              : "",
    model               : "",
    chargeRate          : EChargingScheduleAllowedChargingRateUnit.W,
    autoReset           : true,
    energyMeter         : {
      type        : EMeterType.REVENUE_GRADE,
      serialNumber: "",
      currentValue: 0
    },
    overheatProtection  : false,
    networkMode         : ENetworkModeEVSE.WIFI,
    userInterfaceEnabled: true,
    voltageLimit        : null,
    currentLimit        : null
  }
  hardwareModules: IComponentModules = {
    powerMeters             : [],
    evseRelays              : [],
    connectorRelays         : [],
    overloadProtectionRelays: [],
    hmis                    : {
      indicators: { power: undefined, active: undefined, inactive: undefined }
    },
    communications          : {
      serial  :[],
      ble     :[],
      rfid    :[],
      nfc     :[],
      lora    :[],
      wifi    :[],
      rj45    :[],
      cellular:[]
    }
  }
  
  #ocppTransports: OCPPTransport[] | undefined[]
  #ftpTransports : Array<FTPTransport|SFTPTransport> | undefined[]

  //#commsTransport: 
  //#serialTransports: SerialTransport[]
  //#wanTransports: WANTransport[]
  constructor( options:IEVSEOptions ){
    super()
    console.log("Init EVSE")
    validateOptions( options )
    this.id = options.id
    this.serialNumber = options.serialNumber;
    this.connectors = options.connectors.filter( connector => connector instanceof EVSEConnector ) as EVSEConnector[] || []
    this.#ocppTransports = typeof options.transport === 'object'
                          ? options.transport.filter( transport => transport instanceof OCPPTransport )
                          : options.transport as any instanceof OCPPTransport ? [ options.transport ] : []
    this.#ftpTransports = typeof options.transport === 'object'
                          ? options.transport.filter( transport => transport instanceof FTPTransport || transport instanceof SFTPTransport )
                          : options.transport as any instanceof FTPTransport ? [ options.transport ] : []
    this.configuration = { ...this.configuration, ...options.configuration }
    this.eventsQueue = { ...this.eventsQueue, ...options.eventsQueue }
    this.os = {
      firmware: {
        ...this.os.firmware,
        ...options.os?.firmware
      },
      logs: [],
      diagnostics: {
        ...this.os.diagnostics,
        ...options.os?.diagnostics
      },
      temporaryDirectory: options.os?.temporaryDirectory
     }
    this.manufacturer = { ...this.manufacturer, ...options.manufacturer }
    this.hardwareModules = { ...this.hardwareModules, ...options.hardwareModules }

    if ( !(this instanceof EVSE ) ) {
      return new EVSE( options )
    }
    return (async ()=> {
      try {
        console.log( "Run startup events" )
        await this.#setupEventsQueue()
        console.log( "Start up")
        this.#startUp()
        console.log( "Connect to central system service")
        await this.#connectToCentralSystem()
      } catch ( warn ) {
        console.warn( warn )
      }
      return this
    })() as unknown as this
  }
  async emitEvent( method:string, payload?: IPayload ):Promise<void>{
    let recieved = false
    try {
      for ( const transport of this.#ocppTransports ) {
        if ( !transport ) {
          throw new Error( "Transport Failure" )
        }
        if ( !transport.isConnected() ) continue
        try {
          await transport.sendMessage( method, payload )
          recieved = true
        } catch (e) {
          console.error(e)
        }
      }
      if ( recieved === false ) throw "No available transport connection"
    } catch ( e ) {
      if ( this.eventsQueue.queue instanceof EventsQueue )
      this.eventsQueue.queue.enqueueEvent( method, payload )
    }
  }
  #startUp(){
    try {
      this.#boot()
      this.#heartbeatSetup()
      this.#emitAvailability()
    } catch ( e ){
      console.error( e )
      throw e
    }
  }
  async #setupEventsQueue(){
    if ( !this.eventsQueue ){
      console.warn( "ONLY USE FOR TESTING PURPOSES: Default Event Queue is only using ram. Power reset will result in data loss." )
    }
    const { dbType, host, port } = this.eventsQueue
    
    this.eventsQueue.queue = await new EventsQueue( { dbType, host, port } as IEventsQueueOptions)
    await this.eventsQueue.queue.hydrate()
    
  }
  async #connectToCentralSystem(){
    for ( const transport of this.#ocppTransports ) {
      if ( !transport ) {
        throw new Error( "No transport on extracted transport from #OCPPTransports")
      }
      console.log( "Transport Connect" )
      await transport.connect()
      await this.#listenToOCPPTransport( transport )
    }
    while ( this.eventsQueue.queue && this.eventsQueue.queue.length > 0 ){
      for ( const transport of this.#ocppTransports ) {
        if ( !transport ) {
          throw new Error( "No transport on extracted transport from #OCPPTransports")
        }
        const { method, payload } = await this.eventsQueue.queue.dequeueEvent()
        console.log("sending queued message:", method, payload)
        await transport.sendMessage(method, payload )
      }
    }
  }
  async #listenToOCPPTransport( transport:OCPPTransport ){
    transport.on( "OCPP_EVENT", async eventData => {
      if ( !eventData ) return
      if ( transport.centralSystemService.type === ETransportType.OCPP1_6J ){
        const [ messageType, messageId, eventMethod, eventPayload ] = eventData
        //logger.info( "OCPP_EVENT: ", [ messageType, messageId, eventMethod, eventPayload ] )
        switch( eventMethod ){
          case EEvent.GET_DIAGNOSTICS:{
            const { location } = eventPayload
            try{
              await this.#sendDiagnostics({ location })
              transport.sendResponse( messageId, { status: "Accepted", filename: location } )
            } catch ( e ) {
              console.error( e )
              transport.sendResponse( messageId, { status: "Rejected" } )
            }
            break;
          }
          case EEvent.CHANGE_AVAILABILITY:{
            const { connectorId, type } = eventPayload
            try {
              await this.#updateAvailability( connectorId, type )
              transport.sendResponse( messageId, { status: "Accepted" } )
            } catch ( e ) {
              console.error( e )
              transport.sendResponse( messageId, { status: "Rejected" } )
            }
            break;
          }
          case EEvent.REMOTE_START_TRANSACTION: {
            const {
              idTag,
              connectorId
            } = eventPayload
            try {
              if ( !idTag ) throw new Error( "Missing idTag")
              if ( !connectorId ) throw new Error( "Missing ConnectorId " )
              await this.remoteStartTransaction( idTag, connectorId )
            } catch ( e ) {
              transport.sendResponse( messageId, { status: "Rejected" } )
            }
            break;
          }
          case EEvent.REMOTE_STOP_TRANSACTION: {
            
            break;
          }
          default: break;
        }
      }
    })
  }
  #boot(){
    this.emitEvent(
      "BootNotification",
      {
        chargePointVendor      : this.manufacturer.vendor,
        chargePointModel       : this.manufacturer.model,
        chargePointSerialNumber: this.serialNumber,  // Optional
        chargeBoxSerialNumber  : this.serialNumber,  // Optional
        firmwareVersion        : this.os.firmware?.version,  // Optional
        iccid                  : "",  // Optional
        imsi                   : "123456789012345",  // Optional
        meterType              : this.manufacturer.energyMeter.type
      }
    )
  }
  #heartbeatSetup(){
    setInterval(() => {
      this.lastHeartbeat = new Date().toISOString()
      this.emitEvent( "Heartbeat" )
    }, this.configuration.heartbeatInterval || parseInt( process.env.HEARTBEAT_INTERVAL as string, 10 ) || 120000);
    this.lastHeartbeat = new Date().toISOString()
    this.emitEvent( "Heartbeat" )
  }
  async #ftpUpload( transport:FTPTransport|SFTPTransport, localPath:string , remotePath:string ){
    /**
     * Start EVSE FTP Upload Timer
    */
    performance.mark(EPerfMarksFTPUpload.FTP_UPLOAD_CONNECTING)

    await transport.connect()
    
    const localFileStats:any = statSync(localPath)

    this.emitEvent( "DiagnosticStatusNotification", {
      status    : EDiagnosticStatus.UPLOADING,
      fileName  : remotePath,
      fileSize  : localFileStats.size,
      path      : `${transport.uri}${remotePath}`,
      timestamp : new Date().toISOString(),
      duration  : (
                    performance.mark( EPerfMarksFTPUpload.START_FTP_UPLOAD ),
                    performance.measure(
                      EPerfMeasuresFTPUpload.FTP_TIME_TO_CONNECT,
                      EPerfMarksFTPUpload.FTP_UPLOAD_CONNECTING,
                      EPerfMarksFTPUpload.START_FTP_UPLOAD
                    ),
                    performance.getEntriesByName(EPerfMeasuresFTPUpload.FTP_TIME_TO_CONNECT)[0].duration
                  ),
      retryCount: 0
    })
    await transport.uploadFile( localPath, remotePath )
    this.emitEvent( "DiagnosticStatusNotification", {
      status    : EDiagnosticStatus.UPLOADED,
      fileName  : remotePath,
      fileSize  : localFileStats.size,
      path      : `${transport.uri}${remotePath}`,
      timestamp : new Date().toISOString(),
      duration  : (
        performance.mark( EPerfMarksFTPUpload.COMPLETE_FTP_UPLOAD),
        performance.measure(
          EPerfMeasuresFTPUpload.FTP_TIME_TO_UPLOAD,
          EPerfMarksFTPUpload.START_FTP_UPLOAD,
          EPerfMarksFTPUpload.COMPLETE_FTP_UPLOAD 
        ),
        performance.getEntriesByName(EPerfMeasuresFTPUpload.FTP_TIME_TO_UPLOAD)[0].duration
      ),
      retryCount: 0
    })
    await transport.end()
    Object.values( EPerfMarksFTPUpload ).forEach( mark => performance.clearMarks( mark ) )
    Object.values( EPerfMeasuresFTPUpload ).forEach( measure=> performance.clearMeasures( measure ) )
  }
  
  async #sendDiagnostics({ location, retries, interval, startTimestamp, stopTimestamp }:{location:string, retries?:number, interval?:number, startTimestamp?:string, stopTimestamp?:string}){
    //TODO: manage the retries, interval, startTimestamp, and stopTimestamp
    // const retry = () => this.#ftpUpload( transport, localPath, remotePath )
    const match = location.match(
                /([a-zA-Z]+):\/\/([a-zA-Z0-9._%+-]+):([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)(:[0-9]+)?(\/.*)?/
              )
    if ( !match && this.os.logs?.length === 0 )
      throw new Error("EVSE#sendDiagnostics: [args{location}] not a full URI and log paths[options.os.logs[string]] ")
    if ( !match && this.#ftpTransports.length === 0 )
      throw new Error("EVSE#sendDiagnostics: [args{location}] not a full URI and no FTP transports [options.transports[FTPTransport] ")

    const
      combinedLog = this.os.logs?.map(({name,path})=> `\n--------${name}--------\n ${readFileSync(path)} \n-----------------------\n`).join("\n"),
      combinedLogPath = `${this.os.temporaryDirectory}/combined-log-export-${new Date().toISOString() }.log`

    try {
      if ( typeof combinedLog === "undefined"){
        throw new Error( "No combined log" )
      } 
      writeFileSync( combinedLogPath, combinedLog, { encoding: "utf-8" } )
    } catch ( e ) {
      console.error ("Write File error for temp file: ", combinedLogPath)
    }

    if ( match ){
      const [ remoteProtocol, remoteUsername, remotePassword, remoteHostname, remoteDirtyPort, remotePath = "/" ] = match,
        remotePort = remoteDirtyPort.slice(1) || undefined
      if ( !remoteHostname ) throw new SyntaxError( "EVSE#sendDiagnostics: [location] property missing [hostname]" )
      if ( remoteUsername && !remotePassword ) throw new SyntaxError( "EVSE#sendDiagnostics: Has [username] Missing [password]" ) 
      if ( !remoteUsername && remotePassword ) throw new SyntaxError( "EVSE#sendDiagnostics: Has [password] Missing [username]" )
      const transport = remoteProtocol && remoteProtocol?.toLowerCase() === "sftp"
                          ? new SFTPTransport({
                              host: remoteHostname,
                              port: remotePort,
                              user: remoteUsername,
                              pass: remotePassword
                            })
                          : new FTPTransport({
                              host: remoteHostname,
                              port: remotePort,
                              user: remoteUsername,
                              pass: remotePassword
                            })
      await this.#ftpUpload( transport, combinedLogPath, remotePath )
    } else {
      await Promise.all(
        this.#ftpTransports.map( async ( transport ) => {
          if (!transport ) throw new Error( "Unexpected transport error" )
          await this.#ftpUpload( transport, combinedLogPath, location )
        })
      )
    }
    await new Promise( ( resolve, reject ) => {
      unlink( combinedLogPath, ( err ) => err ? reject( err ) : resolve( true ) )
    })
  }
  #getDiagnosticStatusResponse(){
    this.emit( "GetDiagnosticsResponse", {
      filename: ""
    })
  }
  #emitAvailability():void {
    this.emit(
      EEvent.STATUS_NOTIFICATION,
      {
        connectorId: 0,
        status     : this.availability,
        errorCode  : "NoError",
        info       : "Charger is " + this.availability,
        timestamp  : new Date().toISOString()
      })
    this.connectors.forEach( (connector:EVSEConnector)=> {
      const
        { status } = connector,
        connectorId = connector.getId()
      console.log( `${connectorId}: ${status}`)
      this.emit(
        EEvent.STATUS_NOTIFICATION,
        {
          connectorId,
          status,
          errorCode: "NoError",
          info     : `Connector [${ connectorId }] is: ${status}`,
          timestamp: new Date().toISOString()
        })
    })
  }
  #updateAvailability( connectorId: number, newAvailability: EAvailability.INOPERATIVE | EAvailability.OPERATIVE ){
    const availabilityUpdateMap = {
      [EAvailability.INOPERATIVE]:EAvailability.UNAVAILABLE,
      [EAvailability.OPERATIVE]:EAvailability.AVAILABLE,
    }
    if( connectorId === 0 ) {
      if ( !Object.values( EAvailability ).some( type => type === newAvailability ) ){
        throw new TypeError(`New availablility[${newAvailability}] not accpeted by EVSE` )
      }
      if ( this.availability === newAvailability ) {
        throw new Error( `Cannot change, already set to [${this.availability}]` )
      }
      this.availability = availabilityUpdateMap[ newAvailability ]
    } else {
      this.connectors.filter( connector => connector.id !== connectorId )[0].updateStatus( availabilityUpdateMap[ newAvailability ] as unknown as EConnectorStatus )
    }
    this.#emitAvailability()
  }
  async remoteStartTransaction( idTag: string, connectorId: number ):Promise<void>{
    if ( this.availability === EAvailability.UNAVAILABLE ) throw new Error( "Charger in 'Unavailable' status" )

    const [ connector ]: EVSEConnector[] = this.connectors.filter( c => c.id === connectorId )
    const connectorStatusInfo = connector.getStatus()

    if ( !connector )                                     throw new Error( `No connector with ID: ${ connectorId }`)
    if ( connector.status === EConnectorStatus.FAULTED )  throw new Error( "Connector in Status: Faulted" )
    if ( connector.status === EConnectorStatus.OCCUPIED ) throw new Error( "Connector in Status: Occupied" )
    if ( connector.status === EConnectorStatus.RESERVED ) throw new Error( "Connector in Status: Reserved" )
    
    if ( connectorStatusInfo.isCharging ) throw new Error( `Cannot Start, connector already charging` )
    
    if ( !connectorStatusInfo.isConnected ){
      // set screen value( "awaiting plugged message" )
      await connector.once( "plugged" )
    }

    // check local load management
    // Check building load management
    // check the grid status (DR)
    
    // ContractCertificateAuthentication - eg: iso15118
    if ( await connector.contractCertificateAuthentication() ){
      // idTag (1.6J) - 20 characters
      //   localcache
      //   locallist
      //   remote
      // idToken (2.0.1) - 32 characters
      //   localCache
      //   localList
      //   remote
    }
    // [plugNCharge] get vehicle identification and authentication information
    // [ISO15118]    get v2g readiness and vehicle control signal
    // get charging mode (ac/dc)
    // get max charging voltage and current from vehicle
    // get Charging profile ( charging curve )
    // get power and energy limits
    // get battery health and diagnostic information
    // get Vehicle battery capacity, and remaining energy requirement
    // get target SoC and desired charging range
    // get estimated charge time
    // get battery temperature
    // get vehicle SOC
    
    // set screen value( "starting charge" )
    await connector.startCharging()
  }
}
export default EVSE