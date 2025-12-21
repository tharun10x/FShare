const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });
const clients = require('./client');
const broadcastDeviceList = require('./broadcastDeviceList');
const { handleMsg } = require('./signaling');

wss.on('connection', (socket, req) => {
  const id = Math.random().toString(36).substring(2, 9).toUpperCase();
  
  const deviceInfo = {
    id,
    name: `Device-${id}`,
    ip: req.socket.remoteAddress
  };

  clients.set(id, { socket, deviceInfo });

  console.log(`\n✅ Client connected: ${deviceInfo.name} (${deviceInfo.id})`);
  
  // Send the client their ID
  socket.send(JSON.stringify({
    type: 'connected',
    payload: {
      yourId: id,
      deviceInfo: deviceInfo
    }
  }));

  broadcastDeviceList();
  
  socket.on('message', (raw) => {
    try { 
      const msg = JSON.parse(raw);
      console.log(`\n📨 [${id}] Received:`, msg.type);
      handleMsg(id, msg);  // ✅ Only call once
    }
    catch(err) { 
      console.error('❌ Failed to parse message:', err);
    }
  });
  
  socket.on('close', () => {
    console.log(`\n❌ Client disconnected: ${deviceInfo.name}`);
    clients.delete(id);
    broadcastDeviceList();
  });
  
  socket.on('error', (error) => {
    console.error(`⚠️ Socket error for ${id}:`, error.message);
  });
});

console.log("\n🚀 WebSocket server running on ws://192.168.29.243:8081");
console.log("📡 Waiting for connections...\n");