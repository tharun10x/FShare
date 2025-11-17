const dgram = require("dgram");
const WebSocket = require("ws");
const os = require("os");

const PORT = 41234;
const MULTICAST_ADDR = "230.185.192.108";
const devices = new Map(); // store devices by IP

// UDP socket setup
const udp = dgram.createSocket({ type: "udp4", reuseAddr: true });

udp.on("message", (msg, rinfo) => {
  const data = JSON.parse(msg.toString());
  data.ip = rinfo.address;

  devices.set(rinfo.address, {
    name: data.name,
    ip: rinfo.address,
    lastSeen: Date.now(),
  });

  broadcastToClients([...devices.values()]);
});

udp.bind(PORT, () => {
  udp.addMembership(MULTICAST_ADDR);
  console.log("UDP discovery running...");
});

// Broadcast this device every 2 sec
setInterval(() => {
  const message = Buffer.from(
    JSON.stringify({
      name: "Laptop", // change this per device
      ip: getLocalIP(),
    })
  );

  udp.send(message, 0, message.length, PORT, MULTICAST_ADDR);
}, 2000);

// Clean up stale devices
setInterval(() => {
  const now = Date.now();
  for (let [ip, dev] of devices) {
    if (now - dev.lastSeen > 6000) devices.delete(ip);
  }
  broadcastToClients([...devices.values()]);
}, 3000);

// Helper for local IP
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (let name of Object.keys(nets)) {
    for (let net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
}

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify([...devices.values()]));

  ws.on("close", () => clients.delete(ws));
});

function broadcastToClients(list) {
  const data = JSON.stringify(list);
  clients.forEach((ws) => ws.send(data));
}
