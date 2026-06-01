import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function handleOnline() { setIsOffline(false); }
    function handleOffline() { setIsOffline(true); }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 w-full z-[100] bg-red-500/90 text-white backdrop-blur-md px-4 py-2 flex items-center justify-center gap-2 shadow-md"
        >
          <WifiOff className="h-4 w-4" />
          <span className="text-xs font-semibold tracking-wide uppercase">Sem Conexão à Internet. Operando no modo offline.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
