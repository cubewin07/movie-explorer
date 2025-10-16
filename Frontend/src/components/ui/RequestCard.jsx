import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const RequestCard = ({ request, actions, isPending }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
      onClick={() => navigate(`/user/${request.id}`)}
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="ring-2 ring-transparent group-hover:ring-indigo-400 transition-all duration-300">
          <AvatarImage
            src={request.avatarUrl || `https://avatar.vercel.sh/${request.id}.png`}
          />
          <AvatarFallback>{request?.username?.[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 transition-colors duration-300">
            {request?.username}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {request.mutualFriends
              ? `${request.mutualFriends} mutual friends`
              : actions?.subtitle || "No mutual friends"}
          </p>
        </div>

        {actions?.inline && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              actions.inline.onClick();
            }}
            disabled={isPending}
          >
            {actions.inline.label}
          </Button>
        )}
      </div>

      {actions?.buttons && (
        <div className="flex gap-2 mt-2">
          {actions.buttons.map((btn, i) => (
            <Button
              key={i}
              className="flex-1"
              variant={btn.variant}
              onClick={(e) => {
                e.stopPropagation();
                btn.onClick();
              }}
              disabled={isPending}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RequestCard;
