import { Socket } from "socket.io";
import { sockets } from "../server";

export default function onConnect(socket: Socket) {
  console.log("New client has connected to the server");
  sockets.add(socket);
  console.log(sockets.size, "connected sockets");
}
