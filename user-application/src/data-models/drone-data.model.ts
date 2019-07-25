export class DroneData {
  name: string;
  port: number;
  ipAddress: string;
  comments: string;
  icon: string;
  connected: boolean;
  constructor(name, port, ipAddress, icon, comments) {
    this.name = name;
    this.port = port;
    this.ipAddress = ipAddress;
    this.icon = icon;
    this.comments = comments;
  }
  setConnected( value: boolean ) {
    this.connected = value;
  }

}
