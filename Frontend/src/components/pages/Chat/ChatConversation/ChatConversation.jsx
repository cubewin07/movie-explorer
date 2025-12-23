import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, ArrowDown, Smile, Paperclip, MoreVertical, Phone, Video, MessageCircle, WifiOff, RotateCcw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import useInfiniteMessages from '@/hooks/chat/useInfiniteMessages';
import { useChat } from '@/context/ChatProvider';
import { useAuthen } from '@/context/AuthenProvider';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';
import useHelper from '../helper';

import { useMessageScroll } from './useMessageScroll';
import { useGroupMessages } from './useGroupMessages';
import { useConnectionState } from './useConnectionState';
import { useTypingIndicator } from './useTypingIndicator';
import {
    MAX_MESSAGE_LENGTH,
    SEND_COOLDOWN_MS,
    MESSAGE_SEND_TIMEOUT
} from './chatConstants';
import {
    formatDateHeader,
    getStatusDisplay,
    getRemainingCharacters,
    validateMessage,
    formatMessageTime,
    getMessageAvatarSeed,
    getMessageDisplayName,
    isGroupStart,
    isGroupEnd
} from './messageUtils';

export default function ChatConversation() {
    const { chatId } = useParams();
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [pendingMessages, setPendingMessages] = useState([]);
    const [charWarning, setCharWarning] = useState('');
    const inputRef = useRef(null);
    const sendCooldownRef = useRef(0);
    const prevChatId = useRef(chatId);

    const { sendMessage } = useChat();
    const { user } = useAuthen();
    const { friends } = useWebsocket();
    const { getStatusDisplay: getStatusDisplayHelper } = useHelper();

    // Custom hooks
    const scrollState = useMessageScroll();
    const { isOffline, sendErrorBanner, setSendErrorBanner, showErrorBanner } = useConnectionState();
    const { isComposerTyping, isTyping } = useTypingIndicator(newMessage);

    // Fetch messages
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInfiniteMessages(chatId);

    // Flatten and reverse messages
    const messages = useMemo(() => {
        const allMessages = data?.pages.flatMap(page => page.content) || [];
        return allMessages.reverse();
    }, [data]);

    // Use group messages hook
    const messageState = useGroupMessages(messages, pendingMessages, setPendingMessages);

    // Get friend info
    const friendEmail = useMemo(() => {
        return user?.chats?.find(chat => chat.id === Number(chatId))?.participants?.find(participant => participant.id !== user.id)?.email;
    }, [chatId, user?.chats, user?.id]);

    const friendStatus = useMemo(() => {
        return friends?.find(friend => friend.user.email === friendEmail)?.status;
    }, [friends, friendEmail]);

    const friendInfo = useMemo(() => {
        const chat = user?.chats?.find(chat => chat.id === Number(chatId));
        const participant = chat?.participants?.find(p => p.id !== user?.id);
        return {
            name: participant?.username || participant?.email || 'User',
            email: participant?.email,
            avatarSeed: participant?.email || participant?.id || chatId
        };
    }, [user?.chats, chatId, user?.id]);

    const statusDisplay = getStatusDisplayHelper(friendStatus);

    // Setup infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    const scrollElement = scrollState.scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
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

        if (scrollState.observerTarget.current) {
            observer.observe(scrollState.observerTarget.current);
        }

        return () => {
            if (scrollState.observerTarget.current) {
                observer.unobserve(scrollState.observerTarget.current);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, scrollState.scrollRef]);

    // Reset on chat change
    useEffect(() => {
        if (prevChatId.current !== chatId) {
            scrollState.isUserScrolling.current = false;
            scrollState.prevMessagesLength.current = 0;
            scrollState.setShowScrollButton(false);
            scrollState.scrollButtonEnabled.current = false;
            scrollState.shouldScrollToBottom.current = true;
            prevChatId.current = chatId;
            setPendingMessages([]);
            
            if (messageState.combinedMessages.length > 0) {
                setTimeout(() => {
                    scrollState.scrollToBottom('auto');
                    
                    setTimeout(() => {
                        scrollState.shouldScrollToBottom.current = false;
                        scrollState.scrollButtonEnabled.current = true;
                        scrollState.prevMessagesLength.current = messageState.combinedMessages.length;
                    }, 300);
                }, 100);
            }
        }
    }, [chatId, messageState.combinedMessages.length, scrollState]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (!scrollState.scrollRef.current || messageState.groupedMessages.length === 0) return;

        if (scrollState.shouldScrollToBottom.current) {
            scrollState.setShowScrollButton(false);
            scrollState.scrollButtonEnabled.current = false;
            
            setTimeout(() => {
                scrollState.scrollToBottom('auto');
                
                setTimeout(() => {
                    scrollState.shouldScrollToBottom.current = false;
                    scrollState.scrollButtonEnabled.current = true;
                    scrollState.prevMessagesLength.current = messageState.combinedMessages.length;
                }, 300);
            }, 100);
            return;
        }

        if (messageState.combinedMessages.length > scrollState.prevMessagesLength.current && !isFetchingNextPage && !scrollState.isUserScrolling.current) {
            scrollState.setShowScrollButton(false);
            scrollState.scrollToBottom('smooth');
        }

        scrollState.prevMessagesLength.current = messageState.combinedMessages.length;
    }, [messageState.combinedMessages.length, isFetchingNextPage, messageState.groupedMessages.length, scrollState]);

    // Handle send message
    const handleSendMessage = async (overrideText) => {
        const messageToSend = (overrideText ?? newMessage).trim();
        
        const validation = validateMessage(messageToSend, MAX_MESSAGE_LENGTH);
        if (!validation.isValid) {
            setCharWarning(validation.error);
            return;
        }

        if (!chatId || isSending) return;

        const now = Date.now();
        if (now - sendCooldownRef.current < SEND_COOLDOWN_MS) {
            return;
        }
        sendCooldownRef.current = now;

        const tempId = `temp-${now}`;
        const optimisticMessage = {
            id: tempId,
            text: messageToSend,
            createdAt: new Date().toISOString(),
            senderId: user?.id,
            status: 'sending',
            optimistic: true,
        };

        setPendingMessages((prev) => [...prev, optimisticMessage]);
        if (!overrideText) {
            setNewMessage('');
        }
        setIsSending(true);
        setSendErrorBanner('');
        scrollState.isUserScrolling.current = false;
        scrollState.setShowScrollButton(false);
        scrollState.shouldScrollToBottom.current = true;

        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        messageState.pendingTimeoutsRef.current[tempId] = setTimeout(() => {
            messageState.markPendingStatus(tempId, 'failed');
            setIsSending(false);
            showErrorBanner('Message failed to send. Tap retry.');
        }, MESSAGE_SEND_TIMEOUT);
        
        try {
            await sendMessage(chatId, messageToSend);
            setIsSending(false);
        } catch (error) {
            console.error('Failed to send message:', error);
            if (messageState.pendingTimeoutsRef.current[tempId]) {
                clearTimeout(messageState.pendingTimeoutsRef.current[tempId]);
                delete messageState.pendingTimeoutsRef.current[tempId];
            }
            messageState.markPendingStatus(tempId, 'failed');
            setIsSending(false);
            showErrorBanner('Message failed to send. Tap retry.');
        }
    };

    const retryPendingMessage = (id, text) => {
        setPendingMessages((prev) => prev.filter((msg) => msg.id !== id));
        handleSendMessage(text);
    };

    const remainingChars = getRemainingCharacters(newMessage, MAX_MESSAGE_LENGTH);
    const isOverLimit = remainingChars < 0;
    const lastMessage = messageState.combinedMessages[messageState.combinedMessages.length - 1] || null;

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
                className="p-4 border-b border-indigo-200/60 dark:border-indigo-900/60 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 shadow-lg sticky top-0 z-20"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-all hover:ring-4 h-12 w-12 shadow-lg">
                                <AvatarImage src={`https://avatar.vercel.sh/${friendInfo.avatarSeed}.png`} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg">
                                    {friendInfo.name?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <p className="font-extrabold text-lg text-slate-900 dark:text-white leading-none">
                                {friendInfo.name}
                            </p>
                            {statusDisplay && (
                                <p className={`text-sm ${statusDisplay.color} flex items-center gap-1 mt-0.5 font-medium`}>
                                    {statusDisplay.isOnline ? (
                                        <MessageCircle className="h-3 w-3" />
                                    ) : (
                                        <Clock className="h-3 w-3" />
                                    )}
                                    {statusDisplay.text}
                                </p>
                            )}
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

            {/* Connectivity + errors */}
            <div className="px-4 pt-2 space-y-2">
                <AnimatePresence>
                    {isOffline && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2 text-sm shadow"
                        >
                            <WifiOff className="h-4 w-4" />
                            You are offline. Messages will retry when connection returns.
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {sendErrorBanner && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2 rounded-xl bg-red-100 text-red-700 border border-red-200 px-3 py-2 text-sm shadow"
                        >
                            <RotateCcw className="h-4 w-4" />
                            {sendErrorBanner}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 relative" ref={scrollState.scrollRef}>
                {messageState.combinedMessages.length === 0 ? (
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
                            <div ref={scrollState.observerTarget} className="flex justify-center py-3">
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
                            {messageState.groupedMessages.map((item, index) => {
                                if (item.type === 'date') {
                                    return (
                                        <motion.div
                                            key={`date-${item.dateString}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="flex justify-center my-6"
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
                                const isLastMessage = index === messageState.groupedMessages.length - 1;
                                const isSentByUser = message.senderId === user.id;
                                const previousMessage = messageState.groupedMessages[index - 1]?.type === 'message' ? messageState.groupedMessages[index - 1].data : null;
                                const nextMessage = messageState.groupedMessages[index + 1]?.type === 'message' ? messageState.groupedMessages[index + 1].data : null;
                                const isStart = isGroupStart(message, previousMessage);
                                const isEnd = isGroupEnd(message, nextMessage);
                                const showAvatar = !isSentByUser && isEnd;
                                const isOptimistic = message.optimistic;
                                const messageStatus = message.status;
                                const displayName = getMessageDisplayName(message);
                                const avatarSeed = getMessageAvatarSeed(message);

                                return (
                                    <motion.div
                                        key={message.id}
                                        ref={isLastMessage ? scrollState.lastMessageRef : null}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ 
                                            duration: 0.2,
                                            ease: "easeOut"
                                        }}
                                        className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'} px-2 gap-2`}
                                    >
                                        {!isSentByUser && (
                                            <div className={`pt-6 transition-opacity ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                                <Avatar className="h-8 w-8 shadow">
                                                    <AvatarImage src={`https://avatar.vercel.sh/${avatarSeed}.png`} />
                                                    <AvatarFallback className="text-xs">{displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] sm:max-w-[70%] md:max-w-[65%] rounded-2xl px-3 py-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative group ${
                                                isSentByUser
                                                    ? `bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-500 dark:via-indigo-600 dark:to-purple-500 text-white ${isStart ? 'rounded-br-sm' : 'rounded-br-2xl'} ${isEnd ? 'rounded-tr-sm' : 'rounded-tr-2xl'}`
                                                    : `bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-indigo-100 dark:border-indigo-900/50 ${isStart ? 'rounded-tl-sm' : 'rounded-tl-2xl'} ${isEnd ? 'rounded-bl-sm' : 'rounded-bl-2xl'}`
                                            } ${isOptimistic && messageStatus === 'failed' ? 'opacity-70 border-dashed' : ''}`}
                                        >
                                            {isStart && !isSentByUser && (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                                                    {displayName}
                                                </p>
                                            )}
                                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap [word-break:break-word]">
                                                {message.text || message.content}
                                            </p>
                                            <div className="flex items-center justify-between gap-2 mt-1">
                                                <span className={`text-[10px] font-medium opacity-75 group-hover:opacity-100 transition-opacity ${
                                                    isSentByUser 
                                                        ? 'text-indigo-200 dark:text-indigo-300' 
                                                        : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    {formatMessageTime(message.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {lastMessage && lastMessage.senderId === user?.id && (
                            <div className="flex justify-end px-2">
                                {lastMessage.isRead === true ? (
                                    <div className="mt-1 pr-1">
                                        <Avatar className="h-5 w-5 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-900/50">
                                            <AvatarImage src={`https://avatar.vercel.sh/${friendInfo.avatarSeed}.png`} />
                                            <AvatarFallback className="text-[10px]">
                                                {friendInfo.name?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                ) : (
                                    <span className="mt-1 pr-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        {lastMessage.optimistic
                                            ? (lastMessage.status === 'failed' ? 'Failed' : 'Sent')
                                            : 'Received'}
                                    </span>
                                )}
                            </div>
                        )}

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
                {scrollState.showScrollButton && messageState.combinedMessages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-28 right-6 z-10"
                    >
                        <Button
                            onClick={scrollState.handleScrollToBottom}
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-2 border-white dark:border-slate-900 transition-all hover:scale-110 active:scale-95"
                        >
                            <ArrowDown className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {messageState.lastUserOptimistic && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="px-4 pb-2"
                    >
                        <div className="mx-auto max-w-[75%] sm:max-w-[70%] md:max-w-[65%] rounded-full px-4 py-2 shadow-lg bg-white/90 dark:bg-slate-900/90 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center gap-2 text-xs font-semibold">
                            {messageState.lastUserOptimistic.status === 'sending' && (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                                    <span className="text-slate-700 dark:text-slate-300">Sending…</span>
                                </>
                            )}
                            {messageState.lastUserOptimistic.status === 'failed' && (
                                <>
                                    <RotateCcw className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    <span className="text-red-700 dark:text-red-400">Message failed.</span>
                                    <button
                                        type="button"
                                        onClick={() => retryPendingMessage(messageState.lastUserOptimistic.id, messageState.lastUserOptimistic.text || messageState.lastUserOptimistic.content)}
                                        className="ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow hover:opacity-90 transition"
                                    >
                                        Retry
                                    </button>
                                </>
                            )}
                        </div>
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
                            onChange={(e) => {
                                const nextValue = e.target.value;
                                setNewMessage(nextValue);
                                const remaining = getRemainingCharacters(nextValue, MAX_MESSAGE_LENGTH);
                                if (remaining < 0) {
                                    setCharWarning(`Over limit by ${-remaining} characters`);
                                } else {
                                    setCharWarning('');
                                }
                            }}
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
                        disabled={!newMessage.trim() || isSending || isOverLimit}
                        className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isSending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </form>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
                    <div className="flex items-center gap-2">
                        {isComposerTyping && (
                            <span className="flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Typing…
                            </span>
                        )}
                    </div>
                    <div className={`${isOverLimit ? 'text-red-500 dark:text-red-400 font-semibold' : ''}`}>
                        {charWarning || `${remainingChars} characters left`}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
