const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });
const clients = require('./client')
const broadcastDeviceList = require('./broadcastDeviceList')
const {handleMessage} = require('./signaling')



wss.on('connection', (socket, req) => {
  const id = Math.random().toString(36).substring(2, 9).toUpperCase();
  
  const deviceInfo = {
    id,
    name: `Device-${id}`,
    ip: req.socket.remoteAddress
  };
  

  clients.set(
    id,
    { socket, deviceInfo }
    );

  console.log("Client connected:", deviceInfo);

  broadcastDeviceList();
  
  socket.on('message', (raw) => {
    let msg;
    try { 
      msg = JSON.parse(raw);
      handleMessage(msg.to, socket, msg.type)
      console.log('Received message:', msg);
     }
    catch(err) { 
      console.error('Failed to parse message:', err);
      return; 
    }
    // handleMessage(id, socket, msg);
  });
  socket.on('close', () => {
    console.log("Client disconnected:", deviceInfo.name);
    clients.delete(id);
    broadcastDeviceList();
  });
});



console.log("WebSocket server running on ws://192.168.29.243:8081");

