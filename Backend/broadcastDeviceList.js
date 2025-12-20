const clients = require('./client')
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

module.exports = broadcastDeviceList;