import { motion } from "framer-motion";

function normalizeIp(raw) {
  if (!raw) return '';
  const ip = String(raw);
  const ipv4Match = ip.match(/\d+\.\d+\.\d+\.\d+/);
  if (ipv4Match) return ipv4Match[0];
  const pct = ip.indexOf('%');
  if (pct !== -1) return ip.substring(0, pct);
  return ip;
}

export default function DeviceList({ 
  devices,
  connectedPeers,
  connectionStatus,
  myDeviceName,
  onSelect,
  // ws
  onConnect
 }) 
{


  return (
    <div className="h-full p-6 text-center">

      <p className="mb-2 text-2xl">
        You are: <span className="font-semibold">{myDeviceName ?? 'N/A'}</span>
      </p>

      <motion.h1
        className="mb-8 text-3xl font-bold"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        Available Devices
      </motion.h1>

      <div className="flex justify-center p-2 mx-auto bg-blue-400 shadow rounded-2xl w-fit">
        <p className="text-sm font-semibold text-blue-950">Status: {connectionStatus}</p>
      </div>

      <div className="flex flex-col top-20">
        {devices.length === 0 ? (
          <p className="text-xl text-gray-700">No other devices connected.</p>
        ) : (
          devices.map((d, index) => (
            <motion.button
              key={d.id}  // ❗ use id, not ip
              onClick={() => {
                onSelect(d);
                onConnect(d);
              }}
              className="flex items-center w-auto gap-6 p-4 mt-6 text-white bg-blue-500 shadow-lg rounded-xl hover:bg-blue-600"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: index * 0.12, type: "spring" }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-center w-12 h-10 text-xl font-bold text-blue-600 bg-white rounded-full shadow">
                {d.name.charAt(0)}
              </div>

              <div className="text-left">
                <span className="block mb-1 text-sm font-bold sm:text-lg">{d.name}</span>
                <span className="block mb-1 text-sm text-gray-100 sm:text-lg">{normalizeIp(d.ip)}</span>
              </div>

              <div className="bg-[#65e63d] w-3 h-3 rounded-full ml-auto mr-2"></div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
