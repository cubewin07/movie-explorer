import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react"; // Install: npm i lucide-react

const RequestCard = ({ request, actions, isPending }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/50 hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer"
      onClick={() => navigate(`/user/${request.id}`)}
    >
      {/* Decorative Gradient Blob on Hover */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 dark:bg-indigo-400/10" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <motion.div whileHover={{ scale: 1.05 }} className="relative">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-2 ring-slate-100 transition-all duration-300 group-hover:ring-indigo-100 dark:border-slate-800 dark:ring-slate-800 dark:group-hover:ring-indigo-900">
              <AvatarImage
                src={request.avatarUrl || `https://avatar.vercel.sh/${request.id}.png`}
                className="object-cover"
              />
              <AvatarFallback className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                {request?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Online Indicator (Optional) */}
            <span className="absolute bottom-1 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </motion.div>

          <div className="flex-1 min-w-0 pt-1">
            <h3 className="truncate text-lg font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
              {request?.username || "Unknown User"}
            </h3>
            
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              {request.mutualFriends ? (
                <>
                  <Users className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {request.mutualFriends} mutual friends
                  </span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {actions?.subtitle || "Suggested for you"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mt-5">
          {actions?.inline ? (
             <div className="flex justify-end">
               <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto font-medium transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.inline.onClick();
                }}
                disabled={isPending}
              >
                {actions.inline.label}
              </Button>
             </div>
          ) : actions?.buttons ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              {actions.buttons.map((btn, i) => (
                <motion.div 
                  key={i} 
                  className="flex-1"
                  whileTap={{ scale: 0.96 }}
                >
                  <Button
                    className={`w-full shadow-sm ${
                      // Logic to styling primary vs secondary buttons
                      btn.variant === 'outline' || btn.variant === 'ghost' 
                      ? 'border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500'
                    }`}
                    variant={btn.variant || "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      btn.onClick();
                    }}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      btn.label
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default RequestCard;