import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DeviceList from "./Components/DeviceList";
import FileSender from "./Components/FileSender";

export default function App() {
  const [selectedDevice, setSelectedDevice] = useState(null);

  return (
    <>
    <div className="head">
      <h1 className="my-6 text-4xl font-bold text-center text-gray-800"><span className="text-blue-600">F</span>Share</h1>
    </div>
    <div className="flex items-center justify-center h-[100vh] bg-gray-100">
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
              <DeviceList onSelect={setSelectedDevice} />
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
