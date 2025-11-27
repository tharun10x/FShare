import { motion } from "framer-motion";

// Normalize IP for display: remove IPv6-mapped prefix (::ffff:) and scope ids (%...),
// and prefer extracting an IPv4 address when present.
function normalizeIp(raw) {
  if (!raw) return '';
  const ip = String(raw);

  // Prefer explicit IPv4 if present anywhere in the string
  const ipv4Match = ip.match(/\d+\.\d+\.\d+\.\d+/);
  if (ipv4Match) return ipv4Match[0];

  // Remove scope id like '%eth0' from IPv6 addresses
  const pct = ip.indexOf('%');
  if (pct !== -1) return ip.substring(0, pct);

  // Fallback: return original (could be IPv6)
  return ip;
}

export default function DeviceList({ devices, connectionStatus, myDeviceName, onSelect }) { 

  return (
    <div className="p-6 text-center h-full ">
    <p className="text-2xl mb-2">You are: <span className="font-semibold ">{myDeviceName ? myDeviceName : 'N/A'}</span></p>
      <motion.h1
        className="mb-8 text-3xl font-bold text-black-600"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        Available Devices
      </motion.h1>
      
      {/* Display Connection Status */}
      <div className="bg-blue-400 p-2 rounded-2xl  shadow w-fit flex justify-center mx-auto">
        <p className="text-sm font-semibold text-blue-950">Status: {connectionStatus}</p>
      </div>
      

      <div className="flex flex-col top-20">
        {devices.length === 0 ? (
          <div className="">
          <p className="text-xl text-gray-700">No other devices connected.</p>
          </div>
        ) : (
          devices.map((d, index) => (
            <motion.button
              key={d.ip}
              onClick={() => onSelect(d)}
              className="flex items-center gap-6 p-4 mt-6 w-auto text-white bg-blue-500 shadow-lg hover:bg-blue-600 rounded-xl"
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
              <div className="flex items-center justify-center w-12 h-10 md:w-16 md:h-16 text-xl md:text-2xl font-bold text-blue-600 bg-white rounded-full shadow">
                {d.name.charAt(0)}
              </div>
              <div className="text-left">
              <span className="sm:text-lg text-sm font-bold mb-1 inline-block w-full">{d.name}</span>
              
              <span className="sm:text-lg text-sm text-gray-100 mb-1 inline-block w-full">{normalizeIp(d.ip)}</span>
              </div>
              
              <div className="bg-[#65e63d] w-2 h-2 sm:w-3 sm:h-3 rounded-full ml-auto mr-2 "></div>
            </motion.button>
          ))
        )}
      </div>
      <div className=" text-center mt-10 ">
          <img className="justify-center mx-auto" src="tablet-and-laptop.png " alt="" width="80" />
         <h1 className="text-2xl mt-2">Open FShare on another device.</h1>
          <p>Open this site in another browser.</p><p>Only devices in the same network are shown.</p>
      </div> 
      
    </div>
  );
}