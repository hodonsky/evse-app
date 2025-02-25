import { EventEmitter, once } from "events"
import {
  createCipheriv,
  createDecipheriv,
  createDiffieHellman,
  createECDH,
  createHash
} from "crypto"
import { Socket } from "net"
import { readFileSync } from "fs"

import {
  IFTPTransport,
  IFTPTransportOptions
} from "./interfaces"

const emitter = new EventEmitter()

export class SFTPTransport implements IFTPTransport {
  #connectionConfiguration:IFTPTransportOptions = {
    host    : "localhost",
    port    : 22,
    user    : "",
    pass    : ""
  }
  #connection:any
  #sharedSecret:any
  #encryptionKey:any
  #cipher: any
  #decipher: any
  uri:string = "sftp://"
  /** 
  * @param {object} config - Configuration for SFTP connection.
  * @param {string} config.host - The SFTP server host (default: localhost)
  * @param {string} config.port - The SFTP server port (default: 22).
  * @param {string} config.username - The SFTP username.
  * @param {string} config.password - The SFTP password.
  */
  constructor({
    host   = "localhost",
    port   = 22,
    user   = "",
    pass   = ""
  }:IFTPTransportOptions){
    this.#connectionConfiguration = {
      host, port, user, pass
    }
    if ( user !== "" && pass === "" ) throw new SyntaxError(`SFTPTransport::constructor:IFTPTransportOptions - Has [user] Missing[pass]`)
    if ( pass !== "" && user === "" ) throw new SyntaxError(`SFTPTransport::constructor:IFTPTransportOptions - Has [pass] Missing[user]`)
    const credentialStr = user !== "" ? `${user}:${pass}@` : ""
    const hostStr = port ? `${host}:${port}` : host 
    this.uri = `sftp://${credentialStr}${hostStr}/`
  }
  async connect(){
    this.#connection = new Socket()

    await new Promise( ( resolve, reject ) => {
      this.#connection.connect( this.#connectionConfiguration.port, this.#connectionConfiguration.host, resolve )
      this.#connection.on( "error", reject)
    })
    
    this.#connection.write( "SSH-2.0-GenericClient_1.0\r\n" )

    const serverProtocol:string = await new Promise((resolve, reject):void => {
      let protocolBuffer = Buffer.alloc(0);
      const timeout = setTimeout(() => {
        this.#connection.off("data", onData);
        reject(new Error("Timeout waiting for full server protocol response"));
      }, 3000);

      const onData = (data:Uint8Array) => {
        protocolBuffer = Buffer.concat([protocolBuffer, data]);

        const protocolString = protocolBuffer.toString();
        if (protocolString.includes('curve25519') || protocolString.includes('ecdh-sha2') || protocolString.includes('diffie-hellman')) {
          clearTimeout(timeout);
          this.#connection.off("data", onData);
          resolve(protocolString);
        }
      };

      this.#connection.on("data", onData);
      this.#connection.on("error", (error:Error) => {
        clearTimeout(timeout);
        this.#connection.off("data", onData);
        reject(error);
      });
    });

    console.log("Server Protocol:", serverProtocol);

    const supportedKexAlgorithms:string[] = serverProtocol.match(/curve25519|ecdh-sha2-nistp\d+|diffie-hellman-group\d+-sha\d+/g) || [];
    let clientKex;
    let clientPublicKey;
    
    if (supportedKexAlgorithms.includes("ecdh-sha2-nistp256")) {
      console.debug("Using ecdh-sha2-nistp256 for key exchange");
      clientKex = createECDH("prime256v1");
      clientPublicKey = clientKex.generateKeys();
    } else if (supportedKexAlgorithms.includes("ecdh-sha2-nistp384")) {
      console.debug("Using ecdh-sha2-nistp384 for key exchange");
      clientKex = createECDH("secp384r1");
      clientPublicKey = clientKex.generateKeys();
    } else if (supportedKexAlgorithms.includes("ecdh-sha2-nistp521")) {
      console.debug("Using ecdh-sha2-nistp521 for key exchange");
      clientKex = createECDH("secp521r1");
      clientPublicKey = clientKex.generateKeys();
    } else if (supportedKexAlgorithms.includes("diffie-hellman-group14-sha256")) {
      console.debug("Using diffie-hellman-group14-sha256 for key exchange");
      clientKex = createDiffieHellman(2048);
      clientPublicKey = clientKex.generateKeys();
    } else if (supportedKexAlgorithms.includes("diffie-hellman-group1-sha1")) {
      console.debug("Using diffie-hellman-group1-sha1 for key exchange");
      clientKex = createDiffieHellman(1024);
      clientPublicKey = clientKex.generateKeys();
    } else {
      throw new Error("No compatible key exchange algorithm found");
    }

    const serverPublicKey:Buffer = await new Promise( ( resolve, reject ) =>{
      console.log( "Promise Started" )
      let buffer = Buffer.alloc(0)
      let retryCount = 0
      const maxRetries = 5

      const timeout = setTimeout(() => {
        this.#connection.off("data", onData)
        reject( new Error( "Timeout waiting for server public key" ) )
      }, 30000)

      const onData = (key:Uint8Array) => {
        buffer = Buffer.concat([buffer, key])
        if (buffer.length > 0) {
          clearTimeout(timeout)
          this.#connection.off("data", onData)
          resolve(buffer)
        }
      };

      const sendClientKey = () => {
        if (retryCount < maxRetries) {
          console.log(`Sending client public key to server (Attempt ${retryCount + 1}/${maxRetries})...`);
          this.#connection.write(clientPublicKey);
          retryCount += 1;
        } else {
          clearInterval(retryInterval);
          reject(new Error("Failed to receive server public key after multiple attempts"));
        }
      };
  
      const retryInterval = setInterval(sendClientKey, 5000);
      sendClientKey();

      this.#connection.on("data", onData);

      this.#connection.on("error", (error:Error) => {
        clearTimeout(timeout)
        this.#connection.off("data", onData)
        reject(error)
      });
    })

    console.log("SERVER PUBLIC KEY:", serverPublicKey.toString())
    this.#sharedSecret  = clientKex.computeSecret( serverPublicKey )
    this.#encryptionKey = createHash( "sha256" ).update( this.#sharedSecret ).digest()
    this.#cipher        = createCipheriv("aes-256-ctr", this.#encryptionKey, Buffer.alloc(16, 0));
    this.#decipher      = createDecipheriv( "aes-256-ctr", this.#encryptionKey, Buffer.alloc(16, 0));

    this.#connection.on("data", (encryptedData:string) => {
      const decryptedBuffer = this.#decipher.update(encryptedData, "hex", "utf8") + this.#decipher.final("utf8")

      //const packetLength = decryptedBuffer.readUInt32BE(0)
      const type = decryptedBuffer.readUInt8(4)

      switch (type) {
        case 102:{
          const requestId = decryptedBuffer.readUInt32BE(5);      // Request ID (matches your OPEN request)
          const handleLength = decryptedBuffer.readUInt32BE(9);   // Length of the handle string
          const handle = decryptedBuffer.slice(13, 13 + handleLength).toString('utf8');  // File handle
          console.log(`Request[${requestId}]BUFFER TO STRING: `, decryptedBuffer.toString())
          return emitter.emit( "fileHandle", handle )
        }
        case 101:{ // SSH_FXP_STATUS
          return this.#handleStatusResponse( decryptedBuffer )
        }
        default:
          console.error('Unknown packet type:', type);
      }
    })

    this.#authenticate()
    this.#openSubsystem()
  }
  /**
   * Uploads a file via SFTP using the system's sftp command.
   * @param {string} localPath - The path to the local file.
   * @param {string} remotePath - The destination path on the SFTP server.
   * @returns {Promise<{path:string}|void>}
   */
  async uploadFile(localPath:string, remotePath:string):Promise<{path:string}|void>{
    this.#init()
    this.#openForWrite( remotePath )
    const [ fileHandle ] = await once( emitter, "fileHandle")
    this.#writeToFile( fileHandle, 0, readFileSync( localPath ) )
    this.#closeWrite( fileHandle )
  }

  #writeEncrypted( data:Buffer|string ):void {
    if ( !this.#sharedSecret ) throw new Error( "SFTPTransport#writeEncrypted: missing [sharedSecret]")
    if ( !this.#encryptionKey ) throw new Error( "SFTPTransport#writeEncrypted: missing [encryptionKey]")
    if ( !this.#cipher ) throw new Error( "SFTPTransport#writeEncrypted: missing [cipher]")
    if ( !this.#decipher ) throw new Error( "SFTPTransport#writeEncrypted: missing [decipher]")
    this.#connection.write( this.#cipher.update(data, 'utf8', 'hex') + this.#cipher.final('hex'), 'hex' )
  }

  #authenticate(){
    this.#writeEncrypted(
      JSON.stringify({ type: "USERAUTH_REQUEST", username: this.#connectionConfiguration.user, password: this.#connectionConfiguration.pass, method: "password", service: "ssh-connection" })
    )
  }
  #openSubsystem(){
    //this.#writeEncrypted( JSON.stringify({ type: "CHANNEL_REQUEST", service: "sftp" }) )
    const channelRequestBuffer = Buffer.alloc( 25 )
    channelRequestBuffer.writeUInt32BE( 21, 0 )
    channelRequestBuffer.writeUInt8( 98, 4 )
    channelRequestBuffer.write( "sftp", 5, "utf8" )

    this.#writeEncrypted( channelRequestBuffer )
  }
  //-------------
  #init(){
    const buff = Buffer.alloc(9)
    buff.writeUInt32BE(5, 0)
    buff.writeUInt8(1,4)
    buff.writeUInt32BE(3, 5)
    this.#writeEncrypted( buff )
  }
  #openForWrite( filename:string ){
    const filenameBuffer = Buffer.from(filename, 'utf8')
    const packetLength = 9 + filenameBuffer.length + 4
    const buffer = Buffer.alloc(packetLength)

    buffer.writeUInt32BE(packetLength - 4, 0)
    buffer.writeUInt8(3, 4)
    buffer.writeUInt32BE(1, 5)
    buffer.writeUInt32BE(0x00000002, 9)
    filenameBuffer.copy(buffer, 13)

    this.#writeEncrypted(buffer)
  }
  #writeToFile( fileHandle:string, offset:number, data:Buffer|string ) {
    const fileHandleBuffer = Buffer.from(fileHandle, 'utf8');
    const dataBuffer = data instanceof Buffer ? data : Buffer.from(data as string, 'utf8');
    const packetLength = 17 + fileHandleBuffer.length + dataBuffer.length;
    const buffer = Buffer.alloc(packetLength);
  
    buffer.writeUInt32BE(packetLength - 4, 0);
    buffer.writeUInt8(6, 4);
    buffer.writeUInt32BE(2, 5);
    fileHandleBuffer.copy(buffer, 9);
    buffer.writeBigUInt64BE(BigInt(offset), 9 + fileHandleBuffer.length);
    dataBuffer.copy(buffer, 17 + fileHandleBuffer.length);

    this.#writeEncrypted( buffer );
  }
  #closeWrite( fileHandle:string ){
    const fileHandleBuffer = Buffer.from(fileHandle, 'utf8');
    const packetLength = 9 + fileHandleBuffer.length;
    const buffer = Buffer.alloc(packetLength);
  
    buffer.writeUInt32BE(packetLength - 4, 0);
    buffer.writeUInt8(4, 4);
    buffer.writeUInt32BE(3, 5);
    fileHandleBuffer.copy(buffer, 9);
  
    this.#writeEncrypted(buffer);
  }
  #handleStatusResponse( buffer:Buffer ){
    const requestId = buffer.readUInt32BE(5);    // Request ID (matches your previous request)
    const statusCode = buffer.readUInt32BE(9);   // Status code (e.g., 0 for success)
  
    if (statusCode === 0) {
      console.log(`Request ${requestId} completed successfully.`);
    } else {
      const errorMessageLength = buffer.readUInt32BE(13);  // Length of the error message
      const errorMessage = buffer.slice(17, 17 + errorMessageLength).toString('utf8');
      console.error(`Error on request ${requestId}: ${errorMessage} (Code: ${statusCode})`);
    }
  }
  #closeSubSytem(){
    this.#writeEncrypted( JSON.stringify({ type: "CHANNEL_CLOSE", service: "sftp" }) )
  }
  #disconnect( reasonCode = 11, description = "Client Disconnect"){
    const descriptionBuffer = Buffer.from(description, 'utf8');
    const descriptionLength = descriptionBuffer.length;
    const languageTagBuffer = Buffer.from('', 'utf8');
    const languageTagLength = languageTagBuffer.length;
  
    const packetLength = 1 + 4 + 4 + descriptionLength + 4 + languageTagLength;
    const buffer = Buffer.alloc(4 + packetLength);
  
    buffer.writeUInt32BE(packetLength, 0);
    buffer.writeUInt8(1, 4);
    buffer.writeUInt32BE(reasonCode, 5);
    buffer.writeUInt32BE(descriptionLength, 9)
    descriptionBuffer.copy(buffer, 13);  
    buffer.writeUInt32BE(languageTagLength, 13 + descriptionLength);
    languageTagBuffer.copy(buffer, 17 + descriptionLength);
  
    this.#writeEncrypted(buffer);
  }
  end(){
    this.#closeSubSytem()
    this.#disconnect()
    this.#connection.end()
  }
}

export default SFTPTransport