
### Basic
```js
import { EVSE, EVSEConnector } from "@ho2life/EVSE"

new EVSE({
  connectors: new EVSEConnector({
                type: "CCS",
                powerType: "DC"
              })
})
```

### Basic w/ Transport
```js
import { EVSE, EVSEConnector, Transport } from "@ho2life/EVSE"
import { Transport } from "@ho2life/EVSE/OCPPTransport"

new EVSE({
  connectors: new EVSEConnector({
                type: "CCS",
                powerType: "DC"
              }),
  //default - centralSystemService: { host: "localhost", port: 80, path: "/"}
  transport: new Transport({ events: "BootNotification" })
})
```

### Multiple TLS Transport w/ Queue in Redis
```js

import { EVSE, EVSEConnector, Transport } from "@ho2life/EVSE"
import { Transport } from "@ho2life/EVSE/OCPPTransport"
import { EventQueue } from "@ho2life/EVSE/EventQueue"

new EVSE({
  id          : 0,
  serialNumber: "1o1-2024-1-1",
  connectors  : [
    new EVSEConnector({ id: 1, type: "Type1", powerType: "DC" }),
    new EVSEConnector({ id: 2, type: "CCS", powerType: "DC" })
  ],
  transport   : [
    new Transport({ events: "BootNotification" }),
    new Transport({
      centralSystemService: {
        host: "wss://remote.com", port:443, path:"/evse", protocol: "wss"
        tls: { enabled: true }
      },
      events: [ "BootNotification", "StatusNotification", "TransactionStop"  ]
    }),
    new Transport({
      centralSystemService: {
        host    : process.env.OCPP_HOST,
        port    : process.env.OCPP_PORT,
        path    : process.env.OCPP_PATH,
        protocol: process.env.PROTOCOL,
        tls     : {
          enabled: true,
          cert   :[ readFileSync( "./host.crt", "utf-8" ) ]  
        }
      },
      events: [ "BootNotification", "StatusNotification", "TransactionStop"  ]
    })
  ],
  eventsQueue : new EventQueue({
                            dbType:"redis",
                            host  : "redis://redis.ho2.life",
                            port  : 5432,
                            events : [ "BootNotification", "StatusNotification", "TransactionStop"  ]
                          })
})
```

### Comprehensive Breakdown
```js
import { EVSE, EVSEConnector, Transport } from "@ho2life/EVSE"
import { Transport } from "@ho2life/EVSE/OCPPTransport"
import { EventQueue } from "@ho2life/EVSE/EventQueue"

const bootEvent = "BootNotification"
const actionEvents = [ "StatusNotification", "TransactionStop" ]

const transportOne = new Transport({
  centralSystemService: {
    host:"localhost", port:80, path:"/"
  },
  log: "/tmp/transport-one.log",
  events: bootEvent
})
const transportTwo = new Transport({
  centralSystemService: {
    host:"wss://remote.com", port:443, path:"/evse",
    tls: { enabled: true }
  }
})

const transportThree = new Transport({
  centralSystemService: {
    host, port, path,
    tls: enabled
  },
  events: actionEvents
})
const eventsQueueMemory = new EventQueue({ dbType: "memory" })
const eventsQueueRedis = new EventQueue({
                            dbType:"redis",
                            host: redisHost,
                            port: redisPort,
                            events: actionEvents
                          })
const connectorA = new EVSEConnector({
  id         : 1,
  type       : "CCS",
  powerType  : "DC",
  displayName: "UniqueName1"
})
const connectorB = new EVSEConnector({
  id         : 2,
  type       : "Type1",
  powerType  : "DC",
  displayName: "UniqueName2"
})

const evseOne = new EVSE({
  id          : 1,
  serialNumber: "1o1-2024-1-1",
  transport   : transportOne,
  eventsQueue : eventsQueueMemory,
  connectors  : [ connectorA, connectorB ]
})

const evseTwo = new EVSE({
  id          : 2,
  serialNumber: "1o1-2024-1-2",
  transport   : [ transportOne, transportTwo ],
  eventsQueue : eventsQueueRedis,
  connectors  : [ connectorA, connectorB ]
})

const evseThree = new EVSE({
  id          : 3,
  serialNumber: "1o1-2024-1-3",
  transport   : [
    transportOne,
    transportThree,
    new Transport({
      centralSystemService: {
        host    : process.env.OCPP_HOST,
        port    : process.env.OCPP_PORT,
        path    : process.env.OCPP_PATH,
        protocol: process.env.PROTOCOL,
        tls     : {
          enabled: true,
          cert   : [ readFileSync( process.env.NODE_EXTRA_CA_CERTS, "utf-8" ) ] 
        }
      },
      events: [ bootEvent, ...actionEvents ]
    })
  ],
  eventsQueue : new EventsQueue({
                  type: "sqlite3",
                  events: [ bootEvents, ...actionEvents ]
                }),
  connectors  : [ connectorA, connectorB ]
})
```

## Swagger Docs

[Documentation](https://hodonsky.github.io/evse-resources/)