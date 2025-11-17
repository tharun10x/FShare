import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DeviceList({ onSelect }) {
  const [devices, setDevices] = useState([]);

useEffect(() => {
  const ws = new WebSocket("ws://192.168.29.243:8080");

  ws.onmessage = (event) => {
    setDevices(JSON.parse(event.data));
  };

  return () => ws.close();
}, []);

  return (
    <div className="p-6 text-center">
      <motion.h1
        className="mb-8 text-3xl font-bold text-blue-600"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        Available Devices
      </motion.h1>

      <div className="flex flex-col items-center gap-8">
        {devices.map((d, index) => (
        <motion.button
          key={d.ip}
          onClick={() => onSelect(d)}
          className="flex items-center gap-10 p-4 text-white bg-blue-500 shadow-lg hover:bg-blue-600 rounded-xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.9,
            delay: index * 0.12,
            type: "spring",
          }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-blue-600 bg-white rounded-full shadow">
            {d.name.charAt(0)}
          </div>

          <span className="text-lg font-medium">{d.name}</span>
          <span className="text-sm opacity-80">{d.ip}</span>
        </motion.button>
          ))}
      </div>

    </div>
  );
}
