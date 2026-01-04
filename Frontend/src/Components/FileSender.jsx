import { useState } from "react";
import { motion } from "framer-motion";
import WebRTCService from '../services/WebRTCService';

export default function FileSender({ device, myDeviceName, onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };
  
  const handleSendFile = async () => {  // ← Add async
    if (!selectedFile) {
      alert("Choose a file first!");
      return;
    }

    // Check if data channel is ready
    const dataChannel = WebRTCService.dataChannels.get(device.id);
    if (!dataChannel || dataChannel.readyState !== 'open') {
      alert("⏳ Connection not ready yet. Please wait a moment and try again.");
      console.warn("Data channel not ready:", dataChannel?.readyState || "not found");
      return;
    }

    setIsSending(true);
    setProgress(0);

    try {
      console.log(`📤 Starting file transfer to ${device.id}`);

      await WebRTCService.sendFile(  // ← Add await
        device.id,
        selectedFile,
        (progressPercentage) => {
          setProgress(progressPercentage);
        } 
      );
      
      alert("✅ File sent successfully!");
      setSelectedFile(null);
      setProgress(0);
    } catch (error) {
      console.error("❌ Error sending file:", error);
      alert(`Failed to send file: ${error.message}`);
    } finally {
      setIsSending(false);
    }
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

      {selectedFile ? (
        <div className="mt-4">
          <p className="text-gray-700">
            Selected: <span className="font-semibold">{selectedFile.name}</span>
          </p>
          <p className="text-sm text-gray-500">
            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">Please select a file first</p>
      )}
      
      <div className="flex flex-col items-center gap-4 mt-8">
        {/* Choose File Button */}
        <motion.label
          className="px-6 py-3 text-white bg-blue-500 rounded-lg shadow cursor-pointer hover:bg-blue-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Choose File
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </motion.label>

        {/* Send File Button */}
        {selectedFile && (
          <button
            onClick={handleSendFile}
            disabled={isSending}
            className="px-6 py-3 text-white bg-green-500 rounded-lg shadow hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send File'}
          </button>
        )}

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-full max-w-md mt-4">
            <div className="flex justify-between mb-2 text-sm">
              <span>Transfer Progress</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full h-4 overflow-hidden bg-gray-200 rounded-full">
              <div
                className="h-full transition-all duration-300 bg-green-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}