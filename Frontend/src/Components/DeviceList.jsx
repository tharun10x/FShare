import { motion } from "framer-motion";

export default function DeviceList({ devices, connectionStatus, myDeviceName, onSelect }) { 

  return (
    <div className="p-6 text-center">
    <p className="text-2xl mb-2">You are {myDeviceName ? myDeviceName : '...'}</p>
      <motion.h1
        className="mb-8 text-3xl font-bold text-blue-600"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        Available Devices
      </motion.h1>
      
      {/* Display Connection Status */}
      <p className="mb-4 text-sm text-gray-500">{connectionStatus}</p>

      <div className="flex flex-col items-center gap-8">
        {devices.length === 0 ? (
          <div className="">
          <p className="text-xl text-gray-700">No other devices connected.</p>
          <h1 className="text-2xl mt-2">Open FShare on another device.</h1>
          <p>Open this site in another browser.</p><p>Only devices in the same network are shown.</p>

          </div>
        ) : (
          devices.map((d, index) => (
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
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}