import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useChatBox from '@/hooks/useChatBox';

function CollapsibleChatBox({ sessionToken = "demo-token" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { send } = useChatBox(sessionToken);

  const scrollToBottom = (instant = false) => {
    if (instant) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    } else {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      // Focus input when opening
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      // Scroll to bottom when opening
      scrollToBottom(true);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);
    scrollToBottom(true);

    try {
      const response = await send(userInput);
      
      if (response) {
        // Handle array response format from N8N: [{ "output": "message" }]
        let messageText = 'No response';
        
        if (Array.isArray(response) && response.length > 0) {
          // If response is an array, get the first item's output
          const firstItem = response[0];
          messageText = firstItem?.output || firstItem?.reply || firstItem?.message || JSON.stringify(firstItem);
        } else if (typeof response === 'object') {
          // If response is an object, check for output, reply, or message
          messageText = response.output || response.reply || response.message || JSON.stringify(response);
        } else if (typeof response === 'string') {
          messageText = response;
        }

        const botMessage = {
          id: Date.now() + 1,
          text: messageText,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMessage]);
        
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Failed to send message. Please try again.',
        sender: 'system',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="bg-slate-800 rounded-lg rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-slate-400 rounded-full"
              animate={{
                y: [0, -6, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="ml-2 text-xs text-slate-400">Thinking...</span>
      </div>
    </motion.div>
  );

  // Message animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4 w-96 h-[500px] bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-green-500 rounded-full opacity-75 animate-ping" />
                  <div className="relative w-3 h-3 bg-green-500 rounded-full" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Chat Assistant</h2>
                  <p className="text-xs text-slate-400">Online</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 chat-scrollbar">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center text-slate-500">
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    </motion.div>
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs mt-1">Start a conversation!</p>
                  </div>
                </motion.div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`max-w-[75%] rounded-lg px-3 py-2 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-sm shadow-lg'
                            : message.sender === 'system'
                            ? 'bg-red-900/50 text-red-200 border border-red-800'
                            : 'bg-slate-800 text-slate-100 rounded-bl-sm shadow-lg'
                        }`}
                      >
                        <p className="text-sm break-words leading-relaxed">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1.5">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                  <AnimatePresence>
                    {isLoading && <TypingIndicator />}
                  </AnimatePresence>
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center min-w-[44px]"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 relative"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <motion.div
          animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </>
          )}
        </motion.div>
        {!isOpen && unreadCount === 0 && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-blue-400 rounded-full -z-10"
          />
        )}
      </motion.button>
    </div>
  );
}

export default CollapsibleChatBox;