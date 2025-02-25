"use strict"

import net from "net"
import { NetConnectOpts } from "net"
import { createReadStream } from "fs"

import {
  IFTPTransport,
  IFTPTransportOptions
} from "./interfaces"

const parsePasvResponse = (pasvResponse: string): [string, number] => {
  const match = pasvResponse.match(/(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)/);
  if (!match) {
    throw new Error('FTPTransport#parsePasvResponse: Invalid PASV response format.');
  }
  const ip = `${match[1]}.${match[2]}.${match[3]}.${match[4]}`;
  const port = (parseInt(match[5]) * 256) + parseInt(match[6]);

  return [ip, port];
}


export class FTPTransport implements IFTPTransport {
  #connectionConfiguration:IFTPTransportOptions = {
    host    : "localhost",
    port    : 21,
    user    : "",
    pass    : "",
    secure  : false,
    pasv    : true
  }
  #connection: any
  #connected = false
  uri:string = "ftp://"
  constructor({
    host   = "localhost",
    port   = 21,
    user   = "",
    pass   = "",
    secure = false,
    pasv   = true
  }:IFTPTransportOptions){
    this.#connectionConfiguration = {
      host, port, user, pass, secure, pasv
    }
    if ( user !== "" && pass === "" ) throw new SyntaxError(`FTPTransport::constructor:IFTPTransportOptions - Has [user] Missing[pass]`)
    if ( pass !== "" && user === "" ) throw new SyntaxError(`FTPTransport::constructor:IFTPTransportOptions - Has [pass] Missing[user]`)
    const credentialStr = user !== "" ? `${user}:${pass}@` : ""
    const hostStr = port ? `${host}:${port}` : host 
    this.uri = `${!secure?"ftp":"sftp"}://${credentialStr}${hostStr}/`
  }
  connect(){
    return new Promise( (resolve, reject ) =>{
      this.#connection = net.createConnection({ host: this.#connectionConfiguration.host, port: this.#connectionConfiguration.port } as NetConnectOpts, async () => {
        await new Promise(() => (this.#connection.once( "data", () => { this.#connected = true } ),resolve(true)))
      }).on("error", reject )
    })
  }
  #sendCommand = (command: string, expectedCode: string|undefined):Promise<string> =>
    new Promise( (resolve, reject) => {
      this.#connection.write(`${command}\r\n`);
      this.#connection.on('data', ( data:any ) => {
        const response = data.toString();
        if (response.startsWith('5') || response.startsWith('4')) {
          return reject(new Error(`FTP error[${command}]: ${response}`));
        }

        const code = response.slice(0, 3);
        if (expectedCode && code !== expectedCode) {
          console.debug(`Waiting for expected response code: ${expectedCode}, but got: ${code}`);
          if ( !this.#connectionConfiguration.secure && code === "SSH" ){
            this.end()
            return reject( new Error("SSH Response"));
          }
          return;
        }
        resolve(response);
      });
    });

  async uploadFile(localPath:string, remotePath:string):Promise<{path:string}|void> {
    if( !localPath || !remotePath){
      throw new Error(`FTPTransport::uploadFile: Missing local[${localPath}] or remote[${remotePath}] path.`);
    }
    try {
      await this.#sendCommand( `USER ${this.#connectionConfiguration.user}`, "331");
      await this.#sendCommand( `PASS ${this.#connectionConfiguration.pass}`, "230");
      await this.#sendCommand( `TYPE I`, "200");

      let pasvResponse
      if ( this.#connectionConfiguration.pasv ) {
        pasvResponse = await this.#sendCommand( 'PASV', "227");
      }
      //console.log( "pasv response:", pasvResponse);

      if (typeof pasvResponse !== 'string') {
        throw new Error('FTPTransport::uploadFile: PASV response is not a string.');
      }
      const [host, port] = parsePasvResponse(pasvResponse);
      const dataConnection = net.createConnection({ host, port });

      await this.#sendCommand( `STOR ${remotePath}`, "150" )

      await new Promise( ( resolve, reject ) => {
        const fileStream = createReadStream(localPath);
        fileStream.on( "error", reject );
        fileStream.on( "end", async () => {
          fileStream.close()
          await this.#sendCommand( "QUIT", "221" )
          resolve( true )
        });
        fileStream.pipe( dataConnection, { end: true } );
      })

      return { path: remotePath }
    } catch (err:any ) {
      console.error( new Error( `Error during FTP upload: ${err.message}` ) )
    }
  }
  end(){
    this.#connection.end()
    this.#connected = false
  }
}
export default FTPTransport