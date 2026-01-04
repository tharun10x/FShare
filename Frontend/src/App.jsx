import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DeviceList from "./Components/DeviceList";
import FileSender from "./Components/FileSender";
import WebRTCService from "./services/WebRTCService";

export default function App() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [connectedPeers, setConnectedPeers] = useState(new Set());
  const [myDeviceName, setMyDeviceName] = useState(null);
  const [myId, setMyId] = useState(null);
  const [connectionRequest, setConnectionRequest] = useState(null);
  
useEffect(()=>{
  WebRTCService.connect()
  .then(id=>{
    setMyId(id);
    setMyDeviceName(`Device-${id}`);
    setConnectionStatus('Connected');
    console.log("Connected!!");
    console.log('✅ App.jsx: Connected! My ID:', id);
  })
  .catch(error=>{
    setConnectionStatus("Connection Failed");
    console.log("Failed to connect", error);
  });

  WebRTCService.onDeviceListUpdate = (deviceList)=>{
    console.log("Device List updated", deviceList);
    setDevices(deviceList);
    setConnectionStatus(`Connected ${deviceList.length} Devices(s)`)
  };

  WebRTCService.onConnectionRequest = (peerId, peerName)=>{
        console.log('🔔 Connection request from:', peerName);
      setConnectionRequest({ peerId, peerName });
  };

  WebRTCService.onPeerConnected = (peerId)=>{
    console.log('✅ Peer connected:', peerId);
      setConnectedPeers(prev => new Set([...prev, peerId]));
      setConnectionStatus('Peer Connected!');    
  };

  WebRTCService.onPeerDisconnected = (peerId)=>{
    console.log("Peer disconnect", peerId);
    setConnectedPeers(prev => {
        const newSet = new Set(prev);
        newSet.delete(peerId);
        return newSet;
      });
  };

  WebRTCService.onError = (errorMsg) =>{
    console.error('⚠️ Error:', errorMsg);
    setConnectionStatus(`Error: ${errorMsg}`);
  };
  
  window.WebRTCService = WebRTCService;
  return ()=>{
    WebRTCService.disconnect();
  };
},[])


  const handleConnect = (device) => {
    console.log('🔌 Requesting connection with:', device.id);
    WebRTCService.requestConnection(device.id);
    setConnectionStatus('Connecting to peer...');
  };

  const handleAcceptConnection = () => {
    if (connectionRequest) {
      console.log('✅ Accepting connection from:', connectionRequest.peerId);
      WebRTCService.acceptConnection(connectionRequest.peerId);
      setConnectionRequest(null);
    }
  };

  const handleRejectConnection = () => {
    console.log('❌ Rejecting connection');
    setConnectionRequest(null);
  };
  
  return (
    <>
    <div className="head">
      <h1 className="my-4 text-4xl font-bold text-center text-gray-800"><span className="text-blue-600">F</span>Share</h1>
    </div>
    <div className="flex items-center justify-center h-[100vh] w-full bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full h-[80vh] max-w-lg relative overflow-hidden">

        {connectionRequest && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
              <div className="max-w-sm p-6 bg-white rounded-lg shadow-xl">
                <h2 className="mb-4 text-xl font-bold">Connection Request</h2>
                <p className="mb-6">
                  <strong>{connectionRequest.peerName}</strong> wants to connect and share files.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={handleAcceptConnection}
                    className="flex-1 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={handleRejectConnection}
                    className="flex-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

        <AnimatePresence mode="wait">
          {!selectedDevice && (
            <motion.div
              key="deviceList"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <DeviceList 
                devices={devices}
                connectedPeers={connectedPeers}
                connectionStatus={connectionStatus}
                myDeviceName={myDeviceName}
                onSelect={setSelectedDevice}
                // ws={ws}
                onConnect={handleConnect}
              />
            </motion.div>
          )}

          {selectedDevice && (
            <motion.div
              key="fileSender"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <FileSender
                device={selectedDevice}
                myDeviceName={myDeviceName}
                onBack={() => setSelectedDevice(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
    </>
  );
}
