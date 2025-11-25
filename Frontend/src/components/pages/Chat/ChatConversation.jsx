import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, ArrowDown, Smile, Paperclip, MoreVertical, Phone, Video, MessageCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import useInfiniteMessages from '@/hooks/chat/useInfiniteMessages';
import { useChat } from '@/context/ChatProvider';
import { useAuthen } from '@/context/AuthenProvider';

export default function ChatConversation() {
    const { chatId } = useParams();
    const [newMessage, setNewMessage] = useState('');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const { user } = useAuthen();
    const scrollRef = useRef(null);
    const observerTarget = useRef(null);
    const prevMessagesLength = useRef(0);
    const isUserScrolling = useRef(false);
    const scrollTimeout = useRef(null);
    const lastMessageRef = useRef(null);
    const prevChatId = useRef(chatId);
    const scrollButtonEnabled = useRef(false);
    const shouldScrollToBottom = useRef(true);
    const inputRef = useRef(null);

    const { sendMessage } = useChat();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInfiniteMessages(chatId);

    
    // Flatten all pages into a single messages array and reverse it
    const messages = useMemo(() => {
        const allMessages = data?.pages.flatMap(page => page.content) || [];
        return allMessages.reverse();
    }, [data]);

    // Group messages by date
    const groupedMessages = useMemo(() => {
        const groups = [];
        let currentDate = null;
        
        messages.forEach((message) => {
            const messageDate = new Date(message.createdAt);
            const dateString = messageDate.toDateString();
            
            if (dateString !== currentDate) {
                currentDate = dateString;
                groups.push({
                    type: 'date',
                    date: messageDate,
                    dateString: dateString
                });
            }
            
            groups.push({
                type: 'message',
                data: message
            });
        });
        
        return groups;
    }, [messages]);

    // Format date for display
    const formatDateHeader = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const messageDate = new Date(date);
        
        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    };

    // Smooth scroll to bottom function
    const scrollToBottom = (behavior = 'smooth') => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTo({
                    top: scrollElement.scrollHeight,
                    behavior: behavior
                });
            }
        }
    };

    // Observer for last message visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (scrollButtonEnabled.current) {
                    setShowScrollButton(!entry.isIntersecting);
                }
            },
            { threshold: 0.1 }
        );

        if (lastMessageRef.current) {
            observer.observe(lastMessageRef.current);
        }

        return () => {
            if (lastMessageRef.current) {
                observer.unobserve(lastMessageRef.current);
            }
        };
    }, [groupedMessages.length]);

    // Handle scroll detection
    const handleScroll = () => {
        const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollElement) return;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        isUserScrolling.current = distanceFromBottom > 100;
        
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        
        scrollTimeout.current = setTimeout(() => {
            if (distanceFromBottom < 100) {
                isUserScrolling.current = false;
            }
        }, 150);
    };

    // Attach scroll listener
    useEffect(() => {
        const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [scrollRef.current]);

    // Reset when chatId changes
    useEffect(() => {
        if (prevChatId.current !== chatId) {
            isUserScrolling.current = false;
            prevMessagesLength.current = 0;
            setShowScrollButton(false);
            scrollButtonEnabled.current = false;
            shouldScrollToBottom.current = true;
            prevChatId.current = chatId;
            
            if (messages.length > 0) {
                setTimeout(() => {
                    scrollToBottom('auto');
                    
                    setTimeout(() => {
                        shouldScrollToBottom.current = false;
                        scrollButtonEnabled.current = true;
                        prevMessagesLength.current = messages.length;
                    }, 300);
                }, 100);
            }
        }
    }, [chatId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (!scrollRef.current || groupedMessages.length === 0) return;

        if (shouldScrollToBottom.current) {
            setShowScrollButton(false);
            scrollButtonEnabled.current = false;
            
            setTimeout(() => {
                scrollToBottom('auto');
                
                setTimeout(() => {
                    shouldScrollToBottom.current = false;
                    scrollButtonEnabled.current = true;
                    prevMessagesLength.current = messages.length;
                }, 300);
            }, 100);
            return;
        }

        if (messages.length > prevMessagesLength.current && !isFetchingNextPage && !isUserScrolling.current) {
            scrollToBottom('smooth');
        }

        prevMessagesLength.current = messages.length;
    }, [messages.length, isFetchingNextPage, groupedMessages.length]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
                    if (scrollElement) {
                        const previousScrollHeight = scrollElement.scrollHeight;
                        const previousScrollTop = scrollElement.scrollTop;

                        fetchNextPage().then(() => {
                            requestAnimationFrame(() => {
                                if (scrollElement) {
                                    const newScrollHeight = scrollElement.scrollHeight;
                                    scrollElement.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight);
                                }
                            });
                        });
                    }
                }
            },
            { threshold: 1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleSendMessage = async () => {
        if (newMessage.trim() && chatId && !isSending) {
            const messageToSend = newMessage;
            setNewMessage('');
            setIsSending(true);
            isUserScrolling.current = false;
            
            // Reset textarea height
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
            }
            
            try {
                await sendMessage(chatId, messageToSend);
            } catch (error) {
                console.error('Failed to send message:', error);
                // Optionally restore the message on error
                setNewMessage(messageToSend);
            } finally {
                setIsSending(false);
            }
        }
    };

    const handleScrollToBottom = () => {
        scrollToBottom('smooth');
        isUserScrolling.current = false;
    };

    if (isLoading || !user) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                    <p className="text-slate-700 dark:text-slate-300 font-medium">Loading conversation...</p>
                </motion.div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3"
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-950/50 dark:to-rose-950/50 flex items-center justify-center mx-auto shadow-lg">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-600 dark:text-red-400 font-semibold">Failed to load messages</p>
                    <Button variant="outline" onClick={() => window.location.reload()} className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                        Try Again
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
            {/* Enhanced Header */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transformTemplate={(transform, generated) => {
                    if (!generated) return "";
                    return generated.replace(/scale\([^)]+\)/, "").trim();
                }}
                className="p-4 border-b border-indigo-200/60 dark:border-indigo-900/60 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 shadow-lg sticky top-0 z-20"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-all hover:ring-4 h-12 w-12 shadow-lg">
                                <AvatarImage src={`https://avatar.vercel.sh/${chatId}.png`} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg">UN</AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse shadow-sm" />
                        </div>
                        <div>
                            <p className="font-extrabold text-lg text-slate-900 dark:text-white leading-none">User Name</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                                <MessageCircle className="h-3 w-3" />
                                Active Now
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-all hover:scale-105 active:scale-95">
                            <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-all hover:scale-105 active:scale-95">
                            <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all hover:scale-105 active:scale-95">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 relative" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="text-center space-y-6 max-w-md p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xl"
                        >
                            <motion.div 
                                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl ring-4 ring-indigo-200/50 dark:ring-indigo-900/50"
                                animate={{ 
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{ 
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Send className="h-16 w-16 text-white" />
                            </motion.div>
                            <div>
                                <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-3">
                                    Start the conversation
                                </h3>
                                <p className="text-md text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Send your first message to begin your secure chat.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="space-y-2 pb-4 pt-1">
                        {/* Load more indicator */}
                        {hasNextPage && (
                            <div ref={observerTarget} className="flex justify-center py-3">
                                {isFetchingNextPage && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-lg backdrop-blur-md border border-indigo-200/60 dark:border-indigo-800/60"
                                    >
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Loading messages...</span>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {groupedMessages.map((item, index) => {
                                if (item.type === 'date') {
                                    return (
                                        <motion.div
                                            key={`date-${item.dateString}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="flex justify-center my-6 sticky top-0 z-10"
                                        >
                                            <div className="px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 shadow-md backdrop-blur-lg">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    {formatDateHeader(item.date)}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                }

                                const message = item.data;
                                const isLastMessage = index === groupedMessages.length - 1;
                                const isSentByUser = message.senderId === user.id;

                                return (
                                    <motion.div
                                        key={message.id}
                                        ref={isLastMessage ? lastMessageRef : null}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ 
                                            duration: 0.2,
                                            ease: "easeOut"
                                        }}
                                        className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'} px-2`}
                                    >
                                        <div
                                            className={`max-w-[75%] sm:max-w-[70%] md:max-w-[65%] rounded-2xl p-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative group ${
                                                isSentByUser
                                                    ? 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-500 dark:via-indigo-600 dark:to-purple-500 text-white rounded-br-sm'
                                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm border border-indigo-100 dark:border-indigo-900/50'
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap [word-break:break-word] [overflow-wrap:anywhere]">
                                                {message.text || message.content}
                                            </p>
                                            <span className={`text-[10px] mt-1 block text-right font-medium opacity-75 group-hover:opacity-100 transition-opacity ${
                                                isSentByUser 
                                                    ? 'text-indigo-200 dark:text-indigo-300' 
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                                <Clock className="h-3 w-3 inline mr-1 -mt-0.5" />
                                                {message.time || new Date(message.createdAt).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        <AnimatePresence>
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex justify-start px-2"
                                >
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-2 shadow-lg border border-indigo-100 dark:border-indigo-900/50">
                                        <div className="flex gap-1 items-center">
                                            <motion.span
                                                className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                                            />
                                            <motion.span
                                                className="w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full"
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                                            />
                                            <motion.span
                                                className="w-2 h-2 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full"
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </ScrollArea>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
                {showScrollButton && messages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-24 right-6 z-10"
                    >
                        <Button
                            onClick={handleScrollToBottom}
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-2 border-white dark:border-slate-900 transition-all hover:scale-110 active:scale-95"
                        >
                            <ArrowDown className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enhanced Input Area */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-4 border-t border-indigo-200/60 dark:border-indigo-900/60 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 shadow-2xl sticky bottom-0 z-20"
            >
                <form
                    className="flex items-end gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                >
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="h-12 w-12 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-all hover:scale-105 active:scale-95 text-indigo-600 dark:text-indigo-400"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type a message..."
                            rows={1}
                            disabled={isSending}
                            className="mb-[-5px] w-full resize-none overflow-hidden pr-12 px-4 py-3 rounded-3xl border-2 border-indigo-200 dark:border-indigo-800 focus:ring-4 focus:ring-indigo-300/50 dark:focus:ring-indigo-700/50 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none shadow-inner bg-indigo-50/50 dark:bg-slate-800 transition-all text-sm [word-break:break-word] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                minHeight: '48px',
                                maxHeight: '120px',
                                height: 'auto'
                            }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                        />
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full hover:bg-indigo-100/50 dark:hover:bg-indigo-900/50 transition-all hover:scale-105 active:scale-95 text-indigo-600 dark:text-indigo-400"
                        >
                            <Smile className="h-5 w-5" />
                        </Button>
                    </div>
                    
                    <Button 
                        type="submit" 
                        size="icon"
                        disabled={!newMessage.trim() || isSending}
                        className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isSending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}