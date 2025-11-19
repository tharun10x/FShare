const Websocket = require('ws');
const ws = new Websocket.Server({ port: 8080 });
let clients = [];

function printClientListToConsole(clients) {
  // Map through all connected clients to extract just the device info
  const deviceList = clients.map(socket => {
    // Add a fallback in case deviceInfo is somehow missing or null
    return socket.deviceInfo || { name: 'Unknown Device', ip: 'N/A' };
  });
  
  console.log('--- Current Connected Devices ---');
  console.log(JSON.stringify(deviceList, null, 2));
  console.log('---------------------------------');
}

// Broadcast the full device list to ALL connected clients
function broadcastDeviceList() {
  const deviceList = clients.map(socket => socket.deviceInfo);
  const message = JSON.stringify(deviceList);
  
  clients.forEach(client => {
    if (client.readyState === Websocket.OPEN) {
      client.send(message);
    }
  });
  
  console.log(`✅ Broadcasted list of ${deviceList.length} devices to all clients.`);
}

//Using the webscoket object we do operation for the connection
ws.on('connection', (socket) => {
  console.log('New client connected',socket.name);
  // Add the new client to the list

  socket.id = Math.random().toString(36).substring(2, 9);
  socket.deviceInfo = { 
    name: `Device-${socket.id.toUpperCase()}`, 
    ip: socket._socket.remoteAddress // Gets the client's actual IP
  };
  console.log('New client connected:', socket.deviceInfo.name);
  clients.push(socket);
  console.log('Total clients:', clients.length);
  printClientListToConsole(clients);
  
  // Broadcast updated device list to ALL clients (including the new one)
  broadcastDeviceList();
  
  socket.onmessage = (event) => {
    const welcomeData = JSON.parse(event.data);
    console.log("My device info:", welcomeData[0]);
  };
  
  // Handle the object the clients closes the instances
  socket.on('close', () => {
    const disconnectedName = socket.deviceInfo ? socket.deviceInfo.name : 'Unknown';
    console.log('Client disconnected:', disconnectedName);
    
    // 1. Filter the client out
    clients = clients.filter((s) => s !== socket);
    
    console.log('Total clients remaining:', clients.length);
    
    // 2. Print the updated list to the console
    printClientListToConsole(clients);
    
    // 3. Broadcast updated list to remaining clients
    broadcastDeviceList();
  });
})

console.log('WebSocket server is running on ws://localhost:8080');

