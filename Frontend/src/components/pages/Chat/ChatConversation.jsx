import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, ArrowDown, Smile, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
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
			<div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center"
				>
					<Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
					<p className="text-slate-600 dark:text-slate-400">Loading conversation...</p>
				</motion.div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center space-y-3"
				>
					<div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
						<span className="text-2xl">⚠️</span>
					</div>
					<p className="text-red-600 dark:text-red-400 font-medium">Failed to load messages</p>
					<Button variant="outline" onClick={() => window.location.reload()}>
						Try Again
					</Button>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col relative bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			{/* Enhanced Header */}
			<motion.div 
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transformTemplate={(transform, generated) => {
					if (!generated) return "";  // safety

					// Remove scale(...) but keep translate/rotate etc.
					return generated.replace(/scale\([^)]+\)/, "").trim();
				}}
				className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-sm"
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="relative">
							<Avatar className="ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-all hover:ring-4">
								<AvatarImage src={`https://avatar.vercel.sh/${chatId}.png`} />
								<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">UN</AvatarFallback>
							</Avatar>
							<span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
						</div>
						<div>
							<p className="font-semibold text-slate-900 dark:text-slate-100">User Name</p>
							<p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
								Online
							</p>
						</div>
					</div>
					
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
							<Phone className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
							<Video className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</motion.div>

			{/* Messages Area */}
			<ScrollArea className="flex-1 p-4" ref={scrollRef}>
				{messages.length === 0 ? (
					<div className="h-full flex items-center justify-center">
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
							className="text-center space-y-6 max-w-md"
						>
							<motion.div 
								className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
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
								<h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
									Start the conversation
								</h3>
								<p className="text-slate-600 dark:text-slate-400 leading-relaxed">
									Send a message to begin your chat journey
								</p>
							</div>
						</motion.div>
					</div>
				) : (
					<div className="space-y-2 pb-4">
						{/* Load more indicator */}
						{hasNextPage && (
							<div ref={observerTarget} className="flex justify-center py-3">
								{isFetchingNextPage && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 shadow-sm"
									>
										<Loader2 className="h-4 w-4 animate-spin text-blue-500" />
										<span className="text-xs text-slate-600 dark:text-slate-400">Loading messages...</span>
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
											className="flex justify-center my-6"
										>
											<div className="px-4 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
												<span className="text-xs font-medium text-slate-600 dark:text-slate-400">
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
											className={`max-w-[70%] sm:max-w-[65%] md:max-w-[60%] rounded-lg px-3 py-2 ${
												isSentByUser
													? 'bg-blue-600 dark:bg-blue-500 text-white rounded-br-sm'
													: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
											}`}
										>
											<p className="text-[13px] leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap [word-break:break-word] [overflow-wrap:anywhere]">
												{message.text || message.content}
											</p>
											<span className={`text-[10px] mt-0.5 block ${
												isSentByUser 
													? 'text-blue-200 dark:text-blue-300' 
													: 'text-slate-500 dark:text-slate-400'
											}`}>
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

						{/* Typing Indicator - FIXED: Only controlled by other user typing events */}
						<AnimatePresence>
							{isTyping && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 10 }}
									className="flex justify-start"
								>
									<div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-md px-5 py-3 shadow-lg border border-slate-200 dark:border-slate-700">
										<div className="flex gap-1">
											<motion.span
												className="w-2 h-2 bg-slate-400 rounded-full"
												animate={{ y: [0, -8, 0] }}
												transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
											/>
											<motion.span
												className="w-2 h-2 bg-slate-400 rounded-full"
												animate={{ y: [0, -8, 0] }}
												transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
											/>
											<motion.span
												className="w-2 h-2 bg-slate-400 rounded-full"
												animate={{ y: [0, -8, 0] }}
												transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
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
							className="h-12 w-12 rounded-full shadow-2xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-2 border-white dark:border-slate-900 transition-all hover:scale-110 active:scale-95"
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
				className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80"
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
						className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					>
						<Paperclip className="h-5 w-5 text-slate-600 dark:text-slate-400" />
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
							className="mb-[-5px] w-full resize-none overflow-hidden pr-12 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:outline-none shadow-sm bg-white dark:bg-slate-800 transition-all text-sm [word-break:break-word] disabled:opacity-50 disabled:cursor-not-allowed"
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
							className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
						>
							<Smile className="h-5 w-5 text-slate-600 dark:text-slate-400" />
						</Button>
					</div>
					
					<Button 
						type="submit" 
						size="icon"
						disabled={!newMessage.trim() || isSending}
						className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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