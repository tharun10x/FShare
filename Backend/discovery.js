const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

let clients = new Map();
function broadcastDeviceList() {
  const list = [...clients.values()].map(c => c.deviceInfo);

  const message = JSON.stringify({
    type: "device-list",
    data: list
  });

  clients.forEach(c => {
    if (c.socket.readyState === WebSocket.OPEN) {
      c.socket.send(message);
    }
  });

  console.log("\n========== DEVICE LIST ==========");
  console.log(`Total devices: ${list.length}`);
  list.forEach((device, index) => {
    console.log(`  ${index + 1}. ${device.name} (${device.id}) - ${device.ip}`);
  });
  console.log("=================================\n");
}

wss.on('connection', (socket, req) => {
  const id = Math.random().toString(36).substring(2, 9).toUpperCase();
  
  const deviceInfo = {
    id,
    name: `Device-${id}`,
    ip: req.socket.remoteAddress
  };
  

  clients.set(id, { socket, deviceInfo });

  console.log("Client connected:", deviceInfo);

  broadcastDeviceList();

  socket.on('close', () => {
    console.log("Client disconnected:", deviceInfo.name);
    clients.delete(id);
    broadcastDeviceList();
  });
});


console.log("WebSocket server running on ws://localhost:8081");

