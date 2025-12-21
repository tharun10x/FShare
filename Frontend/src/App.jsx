import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DeviceList from "./Components/DeviceList";
import FileSender from "./Components/FileSender";

export default function App() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [myDeviceName, setMyDeviceName] = useState(null);
  const [ws, setWs] = useState(null);

  // WebSocket connection at App level - persists across navigation
  useEffect(() => {
    const LAPTOP_IP = '192.168.29.243'; 
    const wsConnection = new WebSocket(`ws://${LAPTOP_IP}:8081`);
    setWs(wsConnection);
    let myName = null;

    wsConnection.onopen = () => {
      setConnectionStatus('Connected! Waiting for device list...');
      console.log('Successfully connected to WebSocket server.');
    };

    wsConnection.onerror = (error) => {
      setConnectionStatus('Error connecting to server. Check IP/Firewall.');
      console.error("WebSocket Error:", error);
    };
    
    wsConnection.onclose = () => {
      setConnectionStatus('Connection closed.');
      console.log('WebSocket connection closed.');
    };

    wsConnection.onmessage = (event) => {
    try {
    const msg = JSON.parse(event.data);
    console.log("Received:", msg);

    if (msg.type !== "device-list") {
      console.log("Ignoring non-device-list message");
      return;
    }

    const receivedData = msg.payload.devices; // THIS IS THE DEVICE ARRAY

    console.log("Received device list:", receivedData);

    // Identify OUR device (last one added)
    if (!myName && receivedData.length > 0) {
      const myDevice = receivedData[receivedData.length - 1];
      myName = myDevice.name;
      setMyDeviceName(myName);
      console.log("My device name:", myName);
    }

    const otherDevices = receivedData.filter(d => d.name !== myName);

    setTimeout(() => {
      setDevices(otherDevices);
      setConnectionStatus(` Connected - ${otherDevices.length} Devices `);
    }, 2000);

  } catch (e) {
    console.error("Failed to parse JSON:", event.data, e);
  }
};
  

    return () => wsConnection.close();
  }, []);

  return (
    <>
    <div className="head">
      <h1 className="my-4 text-4xl font-bold text-center text-gray-800"><span className="text-blue-600">F</span>Share</h1>
    </div>
    <div className="flex items-center justify-center h-[100vh] w-full bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full h-[80vh] max-w-lg relative overflow-hidden">

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
                connectionStatus={connectionStatus}
                myDeviceName={myDeviceName}
                onSelect={setSelectedDevice}
                ws={ws}
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
