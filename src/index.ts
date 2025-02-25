"use strict"
//import "./log"
import { readFileSync, writeFileSync }                from "fs"

// import { ECurrentType }                               from "./lib/Component/common/enums"
// import { PowerMeter}                           from "./lib/Component/powermeter"
// import { IPowerMeterConfiguration }                   from "./lib/Component/powermeter/interfaces"
// import { OverCurrentRelay, PowerRelay }               from "./lib/Component/relay"
// import { ERelayType, ERelayPosition, ERelayContacts } from "./lib/Component/relay/enums"
// //import { TRelay }                                     from "./lib/Hardware/relay/types"
// import { IRelayConfiguration }                        from "./lib/Component/relay/interfaces"
// import { ESwitchType }                                from "./lib/Component/switch/enums"
// import { TBLE}                                 from "./lib/Component/communication/ble/types"
// import { TWiFi}                                from "./lib/Component/communication/wifi/types"
// import {
//   RedLED, GreenLED, MultiColorLED, YellowLEDStrip,
//   RedLEDStrip, GreenLEDStrip, MultiColorLEDStrip
// } from "./lib/Component/led"

import { EVSE }                                       from "./lib/EVSE"
// import { EVSEConnector }                              from "./lib/EVSEConnector"
// import { EConnectorType, EChargingMode }              from "./lib/EVSEConnector/enums"
import { OCPPTransport, FTPTransport, SFTPTransport } from "./lib/Transport"
import {
  ETransportType, EEvent,
  EReconnectStrategy, EWebSocketProtocol
} from "./lib/Transport/enums"

// import { readDeviceTree } from "./lib/utils"

// const deviceTree = readDeviceTree( "/proc/device-tree" );
// writeFileSync( "device-tree.json", JSON.stringify( deviceTree, null, 2 ) );

// interface ParseDeviceResponse {
//   PowerMeters: IPowerMeterConfiguration[],
//   Relays     : IRelayConfiguration[],
//   WiFi      ?: TWiFi, 
//   BLE       ?: TBLE
// }

// function parseDevices( deviceTree: File ): ParseDeviceResponse {
//   return {
//     /** Expect Update Commands to have specific shape*/
//     PowerMeters: [{
//       serialNumber    : "230710280012",
//       totalizer       : 0,
//       voltage         : 0,
//       deciWatts       : 0,
//       deciWattHours   : 0,
//       path            : "/dev/ttyUSB0",
//       baudRate        : 9600,
//       activelyMetering: false
//     }],
//     Relays:[{
//       serialNumber   : "0A-FF-0B-CC-B2",
//       type           : ERelayType.POWER,
//       switchType     : ESwitchType.SPST,
//       contacts       : [ ERelayContacts.NO, ERelayContacts.C, ERelayContacts.COIL_P, ERelayContacts.COIL_N ],
//       position       : ERelayPosition.OPEN,
//       coilVoltage    : 5,
//       coilCurrentType: ECurrentType.DC,
//       loadCurrent    : 240,
//       loadCurrentType: ECurrentType.AC,
//       loadVoltage    : 270,
//       path           : "/dev/ttyUSB0"
//     }]
//   }
// }

const
  //{ PowerMeters, Relays } = parseDevices( deviceTree ),
  // connectorId = {
  //   ZERO: Symbol(0),
  //   ONE : Symbol(1),
  //   TWO : Symbol(2)
  // },
  // ledId = {
  //   ONE  : Symbol(1),
  //   TWO  : Symbol(2),
  //   THREE: Symbol(3),
  //   FOUR : Symbol(4),
  //   FIVE : Symbol(5),
  //   SIX  : Symbol(6),
  //   SEVEN: Symbol(7)
  // },
  // connectorName = ["jane", "john", "jake", "bakery", "running", "jumping", "jerking", "jam", "jesup", "james", "sam"],
  // connectorOpts = { chargingMode: EChargingMode.AC, maxCurrent: 32, maxVoltage: 120, cableLength: 100 },
  serialNumber = "1o1-2024-b1-00001"
  // led = {
  //   single: {
  //     red       : new RedLED( ledId.ONE, "Main", "Front & Top" ),
  //     green     : new GreenLED( ledId.TWO, "Action", "Front & Top"),
  //     multicolor: new MultiColorLED( ledId.THREE, "Status"  )
  //   },
  //   strip: {
  //     red       : new RedLEDStrip( ledId.FOUR, "Main", "TOP" ),
  //     green     : new GreenLEDStrip( ledId.FIVE, "Action", "TOP"),
  //     yellow    : new YellowLEDStrip( ledId.SEVEN, "Warning", "Yellow Strip" ),
  //     multicolor: new MultiColorLEDStrip( ledId.SIX, "Status", "Wraps edge" )
  //   }
  // },
  // powerMeter = {
  //   ZERO: new PowerMeter(PowerMeters[0]),
  //   ONE : new PowerMeter(PowerMeters[0]),
  //   TWO : new PowerMeter(PowerMeters[0])
  // },
  // relay = {
  //   ZERO : new OverCurrentRelay(Relays[0]),
  //   ONE  : new PowerRelay(Relays[0]),
  //   TWO  : new PowerRelay(Relays[0]),
  //   THREE: new PowerRelay(Relays[0])
  // }


const charger = new EVSE({
  id          : 0,
  serialNumber,
  connectors  : [
    // new EVSEConnector({
    //   ...connectorOpts,
    //   id           : connectorId.ONE,
    //   connectorType: EConnectorType.TYPE1,
    //   powerMeters  : [ powerMeter.ONE ],
    //   relays       : {
    //     power      : relay.ONE,
    //     overCurrent: relay.ZERO
    //   },
    //   displayName: connectorName.pop()
    // }),
    // new EVSEConnector({
    //   ...connectorOpts,
    //   id           : connectorId.TWO,
    //   connectorType: EConnectorType.CCS1,
    //   powerMeters  : [ powerMeter.TWO ],
    //   relays       : {
    //     power      : relay.TWO,
    //     overCurrent: relay.ZERO
    //   },
    //   displayName: connectorName.pop()
    // })
  ],
  // os:{
  //   logs: [{ name: "TestLog", path:"/usr/src/app/src/test.log" }]
  // },
  // hardwareModules: {
  //   powerMeters: Object.values( powerMeter ),
  //   connectorRelays: [ relay.TWO, relay.THREE ],
  //   hmis:{
  //     indicators   : {
  //       power    : led.single.red.solid,
  //       active   : led.single.red.solid,
  //       preparing: led.single.red.blinkFast,
  //       charging : led.single.red.blinkSlow,
  //       error    : led.strip.red.blinkSlow,
  //       faulted  : led.strip.red.solid,
  //       updating : led.strip.yellow.blinkFast,
  //       inactive : led.strip.red.blinkSlow
  //     }
  //   },
  //   evseRelays              : [ relay.ONE ],
  //   overloadProtectionRelays: [ relay.ZERO ],
  //   communications          : {
  //     serial: [],
  //     wifi  : [],
  //     rj45  : []
  //   }
  // },
  transport   : [
    // new SFTPTransport({
    //   host  : "eu-central-1.sftpcloud.io",
    //   port  : 22,
    //   user  : "31df361ca3b64065aeca0b4ee9bcc638",
    //   pass  : "cjQG3jqVMz2x3mF83DhCzuOwecyaXenj"
    // }),
    // new FTPTransport({
    //   host: "eu-central-1.sftpcloud.io",
    //   port: 21,
    //   user: "247d21666ad84822a3c104d218707806",
    //   pass: "dV3Nl2HJR7revEy0OJhXLsbeSonBZ5Cv"
    // }),
    // new OCPPTransport({
    //   centralSystemService:{
    //     type    : ETransportType.OCPP1_6J,
    //     host    : "steve",
    //     port    : 8180,
    //     path    : `/steve/websocket/CentralSystemService/${serialNumber}`,
    //     protocol: EWebSocketProtocol.WS,
    //   },
    //   events: Object.values( EEvent )
    // }),
    new OCPPTransport({
      centralSystemService: {
        type    : ETransportType.OCPP1_6J,
        host    : process.env.OCPP_HOST,
        port    : process.env.OCPP_PORT as unknown as number,
        path    : `${process.env.OCPP_PATH}/${serialNumber}`,
        protocol: process.env.PROTOCOL as EWebSocketProtocol,
        tls     : {
          enabled: true,
          cert   : [
            readFileSync( "/usr/local/share/ca-certificates/nginx.crt", "utf-8" )
          ]  
        },
        reconnect:{
          strategy: EReconnectStrategy.LINEAR,
          timeout : 1000,
          attempts: 10
        }
      },
      events: Object.values( EEvent )
    })
  ]
})