export class DroneData {
  private name: string;
  private port: number;
  private ipAddress: string;
  private comments: string;
  private icon: string;
  private connected: boolean;
  constructor(name, port, ipAddress, icon, comments) {
    this.name = name;
    this.port = port;
    this.ipAddress = ipAddress;
    this.icon = icon;
    this.comments = comments;
    this.connected = false;
  }
  setConnected( value: boolean ) {
    this.connected = value;
  }

}
