import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { GameState, SocketServer } from "./types";

import onConnect from "./events/onConnect";
import onDisconnect from "./events/onDisconnect";
import Game from "./entities/Game/Game";
import onJoinGame from "./events/join-game/on-join-game";
// import onMovePlayer from "./events/move-player/move-player";
import onSetPlayerPosition from "./events/move-player/set-player-position";
import onMoveTile from "./events/move-player/on-move-tile";

const port = 2142;
const app = express();
const server = http.createServer(app);
export const io: Server = new Server<SocketServer>(server, {
  cors: { origin: "http://localhost:5173" },
});

app.get("/", (req, res) => {
  res.send("<h1>Server status: Live</h1>");
});

export const sockets = new Set<Socket>();

const game = new Game(io, {
  name: "Unnamed Server",
  type: "Free For All",
  language: "Dutch",
  size: { rows: 100, cols: 150 },
  timer: 100,
  minWordLength: 3,
  density: { tiles: 3, walls: 15 },
  questionMarks: 16, // One in
});

io.on("connection", (socket: Socket) => {
  //Connection events
  onConnect(socket);
  onDisconnect(socket);

  //Game events
  onJoinGame(socket, game);
  // onMovePlayer(socket, game);
  onMoveTile(socket, game);
  onSetPlayerPosition(socket, game);
});

server.listen(port, () => {
  console.log("Server live on port:", port);
});
