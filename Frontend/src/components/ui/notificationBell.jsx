import { useState } from "react";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  // Example notifications (you can later fetch from backend)
  const notifications = [
    { id: 1, message: "New movie added to your Watchlist!" },
    { id: 2, message: "Friend request accepted." },
    { id: 3, message: "New episode available for your favorite show." },
  ];

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-xl hover:bg-slate-800 transition"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown notification list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <h3 className="text-white text-sm font-semibold">Notifications</h3>
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            <ul className="max-h-60 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="px-4 py-3 text-sm text-gray-300 hover:bg-slate-800 cursor-pointer transition"
                >
                  {n.message}
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="px-4 py-3 text-gray-400 text-sm text-center">
                  No new notifications
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
