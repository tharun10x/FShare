class WebRTCService {
  constructor() {
    this.serverUrl = 'ws://192.168.29.243:8081';
    this.ws = null;
    this.myId = null;
    this.devices = [];
    this.peerConnections = new Map();
    this.dataChannels = new Map();
    
    this.onConnected = null;
    this.onDeviceListUpdate = null;
    this.onConnectionRequest = null;
    this.onPeerConnected = null;
    this.onPeerDisconnected = null;
    this.onError = null;
    this.onFileReceived = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        console.log('✅ Connected to server');
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        this.handleServerMessage(msg);
        
        if (msg.type === 'connected') {
          resolve(msg.payload.yourId);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        if (this.onError) this.onError('Connection failed');
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('❌ Disconnected from server');
      };
    });
  }

  sendToServer(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = { type, payload };
      console.log(`📤 Sending: ${type}`);
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('❌ WebSocket not connected');
    }
  }

  handleServerMessage(msg) {
    console.log(`📨 Received: ${msg.type}`);
    
    const { type, payload } = msg;
    
    switch(type) {
      case 'connected':
        this.myId = payload.yourId;
        if (this.onConnected) this.onConnected(this.myId);
        break;
        
      case 'device-list':
        this.devices = payload.devices.filter(d => d.id !== this.myId);
        if (this.onDeviceListUpdate) {
          this.onDeviceListUpdate(this.devices);
        }
        break;
        
      case 'connection-request':
        if (this.onConnectionRequest) {
          this.onConnectionRequest(payload.senderId, payload.senderName);
        }
        break;
        
      case 'offer':
        this.handleOffer(payload.senderId, payload.offer);
        break;
        
      case 'answer':
        this.handleAnswer(payload.senderId, payload.answer);
        break;
        
      case 'ice-candidate':
        this.handleIceCandidate(payload.senderId, payload.candidate);
        break;
        
      case 'error':
        console.error(`Server error: ${payload.message}`);
        if (this.onError) this.onError(payload.message);
        break;
    }
  }

  createPeerConnection(peerId) {
    console.log(`🔧 Creating peer connection with ${peerId}`);
    
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(config);
    this.peerConnections.set(peerId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`   📡 Sending ICE candidate to ${peerId}`);
        this.sendToServer('ice-candidate', {
          targetId: peerId,
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`   🔗 Connection state: ${pc.connectionState}`);
      
      if (pc.connectionState === 'connected') {
        console.log(`   ✅ Connected to ${peerId}!`);
        if (this.onPeerConnected) this.onPeerConnected(peerId);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log(`   ❌ Connection failed/disconnected`);
        if (this.onPeerDisconnected) this.onPeerDisconnected(peerId);
      }
    };

    pc.ondatachannel = (event) => {
      console.log(`   📺 Received data channel from ${peerId}`);
      this.setupDataChannel(peerId, event.channel);
    };

    return pc;
  }

  async createOffer(peerId) {
    console.log(`🚀 Creating offer for ${peerId}`);
    
    try {
      const pc = this.createPeerConnection(peerId);
      const channel = pc.createDataChannel('fileTransfer', {
        ordered: true
      });
      this.setupDataChannel(peerId, channel);
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      console.log('✅ Offer created');
      
      this.sendToServer('offer', {
        targetId: peerId,
        offer: pc.localDescription
      });
      
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      if (this.onError) this.onError('Failed to create offer');
    }
  }

  async handleOffer(peerId, offer) {
    console.log(`📩 Handling offer from ${peerId}`);
    
    try {
      const pc = this.createPeerConnection(peerId);
      await pc.setRemoteDescription(offer);
      
      console.log('✅ Remote description set');
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      console.log('✅ Answer created');
      
      this.sendToServer('answer', {
        targetId: peerId,
        answer: pc.localDescription
      });
      
    } catch (error) {
      console.error('❌ Error handling offer:', error);
      if (this.onError) this.onError('Failed to handle offer');
    }
  }

  async handleAnswer(peerId, answer) {
    console.log(`📨 Handling answer from ${peerId}`);
    
    try {
      const pc = this.peerConnections.get(peerId);
      
      if (!pc) {
        console.error(`❌ No peer connection found for ${peerId}`);
        return;
      }
      
      await pc.setRemoteDescription(answer);
      console.log('✅ Answer processed - connection should establish soon');
      
    } catch (error) {
      console.error('❌ Error handling answer:', error);
      if (this.onError) this.onError('Failed to handle answer');
    }
  }

  async handleIceCandidate(peerId, candidate) {
    console.log(`🧊 Handling ICE candidate from ${peerId}`);
    
    try {
      const pc = this.peerConnections.get(peerId);
      
      if (!pc) {
        console.error(`❌ No peer connection found for ${peerId}`);
        return;
      }
      
      await pc.addIceCandidate(candidate);
      console.log('✅ ICE candidate added');
      
    } catch (error) {
      console.error('❌ Error handling ICE candidate:', error);
    }
  }

  setupDataChannel(peerId, channel) {
    console.log(`📺 Setting up data channel with ${peerId}`);
    
    channel.binaryType = 'arraybuffer';
    this.dataChannels.set(peerId, channel);
    let receivedBuffers = [];  // Array to store chunks
    let receivedSize = 0;      
    let fileMetadata = null; 

    channel.onopen = () => {
      console.log(`   ✅ Data channel opened with ${peerId}`);
      if (this.onPeerConnected) this.onPeerConnected(peerId);
    };

    channel.onclose = () => {
      console.log(`   ❌ Data channel closed with ${peerId}`);
      this.dataChannels.delete(peerId);
    };

    channel.onerror = (error) => {
      console.error(`   ⚠️ Data channel error:`, error);
    };

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        console.log(`   📩 File metadata from ${peerId}:`, event.data);
        fileMetadata = JSON.parse(event.data);
        receivedBuffers = [];
        receivedSize = 0;
      } else {
        // Binary data - file chunk
        receivedBuffers.push(event.data);
        receivedSize += event.data.byteLength;
        const progress = (receivedSize / fileMetadata.size) * 100;
        console.log(`   📦 Received ${event.data.byteLength} bytes (${progress.toFixed(1)}%)`);
        
        // File completely received
        if (receivedSize >= fileMetadata.size) {
          const blob = new Blob(receivedBuffers, { type: fileMetadata.mimeType });
          console.log(`✅ File received completely: ${fileMetadata.name}`);
          if (this.onFileReceived) {
            this.onFileReceived(fileMetadata, blob);
          }
          receivedBuffers = [];
          receivedSize = 0;
          fileMetadata = null;
        }
      }
    };
  }

  requestConnection(targetId) {
    console.log(`🔌 Requesting connection with ${targetId}`);
    this.sendToServer('connection-request', {
      targetId: targetId,
      senderName: `Device-${this.myId}`
    });
  }

  acceptConnection(peerId) {
    console.log(`🤝 Accepting connection from ${peerId}`);
    this.createOffer(peerId);
  }

  sendMessage(peerId, message) {
    const channel = this.dataChannels.get(peerId);
    if (channel && channel.readyState === 'open') {
      channel.send(message);
      console.log(`✅ Sent message to ${peerId}`);
      return true;
    } else {
      console.error(`❌ Data channel not ready for ${peerId}`);
      return false;
    }
  }

  disconnect() {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.dataChannels.clear();
    if (this.ws) this.ws.close();
  }

  sendFile(peerId, file, onProgress){
    return new Promise((resolve, reject)=>{
        const channel = this.dataChannels.get(peerId);
        
        if (!channel) {
          console.error(`❌ No data channel found for ${peerId}`);
          reject(new Error(`No data channel found. Connection may not be established yet.`));
          return;
        }
        
        if (channel.readyState !== 'open') {
          console.error(`❌ Data channel not open. State: ${channel.readyState}`);
          reject(new Error(`Data channel is ${channel.readyState}. Connection not ready.`));
          return;
        };

        console.log(`📤 Sending file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

        const metadata = {
            type: 'file-start',
            name: file.name,
            size: file.size,
            mimeType: file.type
        };
        
        // Send metadata first
        channel.send(JSON.stringify(metadata));
        console.log('📤 Sent file metadata:', metadata);
        
        const CHUNK_SIZE = 1024 *16;
        const reader = new FileReader();
        let offset = 0;

        reader.onload = (e)=>{
            try {
                channel.send(e.target.result);
                offset +=e.target.byteLength;
                const progress = (offset/file.size)*100;
                console.log(`📤 Sending chunk: offset=${offset}, progress=${progress.toFixed(1)}%`);

                if(onProgress) onProgress(progress);
                
                if (offset < file.size) {
                  console.log(`📤 Reading next chunk from offset ${offset}`);
                  readSlice(offset);
                } else {
                  console.log('✅ File sent successfully!');
                  resolve();
                }
                
            } catch (error) {
                console.error('❌ Error sending chunk:', error);
                reject(error);
            }
        }
        reader.onerror = (error)=>{
            console.log("Error in sending the file");
            reject(error);
        }
        const readSlice = (o) => {
            const slice = file.slice(o, o + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
        };
        
        // Start reading the first chunk
        readSlice(0);
    });
  }
}

export default new WebRTCService();