import { useState } from "react";
import { motion } from "framer-motion";


export default function FileSender({ device, onBack }) {
  const [file, setFile] = useState(null);

  const sendFile = () => {
    if (!file) {
      alert("Choose a file first!");
      return;
    }
    const name = document.getElementById('send');
    
    fetch("http://192.168.29.243:8081/api/submit",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({name})
    })
    alert(`Pretending to send ${file.name} to ${device.name}`);
  };

 
  return (
    <div className="relative p-6 text-center">
      <button
        onClick={onBack}
        className="absolute text-lg font-bold text-gray-600 left-4 top-4 hover:text-black"
      >
        ← Back
      </button>

      <h1 className="mb-1 text-2xl font-semibold">Sending file to</h1>
      <h2 className="text-xl font-bold text-blue-600">{device.name}</h2>

      
      {file && (
        <p className="mt-4 text-gray-700">
          Selected File: <span className="font-semibold">{file.name}</span>
        </p>
      )}
      {/* Choose File Button */}
      <div className="flex justify-around">
      <div className="mt-8">
        <motion.label
          className="px-4 py-2 text-white bg-blue-500 rounded-lg shadow cursor-pointer hover:bg-blue-600"
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

      {/* Send File Button */}
      <button
        onClick={sendFile}
        className="px-6 py-2 mt-6 text-white bg-green-500 rounded-lg shadow hover:bg-green-600"
        id="send"
      >
        Send File
      </button>
      </div>
    </div>
  );
}
