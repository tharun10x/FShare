import { useState } from "react";
import { motion } from "framer-motion";

export default function FileSender({ device, onBack }) {
  const [file, setFile] = useState(null);

  const sendFile = () => {
    if (!file) {
      alert("Choose a file first!");
      return;
    }

    alert(`Pretending to send ${file.name} to ${device.name}`);
  };

  return (
    <div className="p-6 text-center relative">
      <button
        onClick={onBack}
        className="absolute left-4 top-4 text-lg text-gray-600 font-bold hover:text-black"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-semibold mb-1">Sending file to</h1>
      <h2 className="text-xl font-bold text-blue-600">{device.name}</h2>

      {/* Choose File Button */}
      <div className="mt-8">
        <motion.label
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
        >
          Choose File
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </motion.label>
      </div>

      {file && (
        <p className="mt-4 text-gray-700">
          Selected File: <span className="font-semibold">{file.name}</span>
        </p>
      )}

      {/* Send File Button */}
      <button
        onClick={sendFile}
        className="mt-6 bg-green-500 hover:bg-green-600 px-6 py-2 text-white rounded-lg shadow"
      >
        Send File
      </button>
    </div>
  );
}
