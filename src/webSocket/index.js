import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3002 });

const clients = new Map();

wss.on("connection", function connection(ws, req) {
  const params = new URLSearchParams(req.url.replace("/", ""));
  const clientId = params.get("id");

  clients.set(clientId, ws);

  ws.on("message", function incoming(message) {
    console.log(`Received from ${clientId}: ${message}`);
  });

  ws.on("close", () => {
    clients.delete(clientId);
  });
});

export function sendToClient(clientId, message) {
  const client = clients.get(clientId);

  if (client && client.readyState === WebSocket.OPEN) {
    client.send(message);
  }
}
