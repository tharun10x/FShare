const clients = require('./client')
const WebSocket = require('ws')
function broadcastDeviceList() {
  const list = [...clients.values()].map(c => c.deviceInfo);

  const message = JSON.stringify({
    type: "device-list",
    payload: { devices: list }
  });

  clients.forEach(c => {
  if (!c.socket || c.socket.readyState !== WebSocket.OPEN) return;
  c.socket.send(message);
});


  console.log("\n========== DEVICE LIST ==========");
  console.log(`Total devices: ${list.length}`);
  list.forEach((device, index) => {
    console.log(`  ${index + 1}. ${device.name} (${device.id}) - ${device.ip}`);
  });
  console.log("=================================\n");
}

module.exports = broadcastDeviceList;