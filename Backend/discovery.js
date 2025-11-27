const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

let clients = new Map(); // id → socket + device info

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

// function handleOffer(data, ws) {
//   wss.clients.forEach(function each(client) {
//     if (client !== ws && client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify({
//         type: 'offer',
//         offer: data.offer,
//         from: data.from,
//         to: data.to
//       }));
//     }
//   });
// }

// function handleAnswer(data, ws) {
//   wss.clients.forEach(function each(client) {
//     if (client !== ws && client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify({
//         type: 'answer',
//         answer: data.answer,
//         from: data.from,
//         to: data.to
//       }));
//     }
//   });
// }

// function handleCandidate(data, ws) {
//   wss.clients.forEach(function each(client) {
//     if (client !== ws && client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify({
//         type: 'candidate',
//         candidate: data.candidate,
//         from: data.from,
//         to: data.to
//       }));
//     }
//   });
// }

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

  socket.on('message', (data) => {
    try {
      const text = typeof data === 'string' ? data : data.toString('utf8');
      const msg = JSON.parse(text);
      console.log('Received message:', msg);
      
       switch (msg.type) {
      case "offer":
      sendTo(msg.to, {
        type: "offer",
        from: id,
        offer: msg.offer
      });
      break;

      case "answer":
      sendTo(msg.to, {
        type: "answer",
        from: id,
        answer: msg.answer
      });
      break;

      case "candidate":
      sendTo(msg.to, {
        type: "candidate",
        from: id,
        candidate: msg.candidate
      });
      break;

      default:
      console.log("Unknown message:", msg);
      }
      // Add your message handling logic here
      // For example: file transfer, signaling, etc.
      
    } catch (err) {
      let preview;
      try {
        preview = (typeof data === 'string') ? data.slice(0, 200) : (data && data.toString ? data.toString('utf8', 0, 200) : String(data));
      } catch (e) {
        preview = '<unserializable data>';
      }
      console.error('Failed to parse message:', err.message, 'preview:', preview);
    }
  });

  socket.on('close', () => {
    console.log("Client disconnected:", deviceInfo.name);
    clients.delete(id);
    broadcastDeviceList();
  });
});

console.log("WebSocket server running on ws://localhost:8081");

  