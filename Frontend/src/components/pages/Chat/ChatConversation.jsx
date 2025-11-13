import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import useInfiniteMessages from '@/hooks/chat/useInfiniteMessages';
import { useChat } from '@/context/ChatProvider';

export default function ChatConversation() {
	const { chatId } = useParams();
	const [newMessage, setNewMessage] = useState('');
	const [showScrollButton, setShowScrollButton] = useState(false);
	const scrollRef = useRef(null);
	const observerTarget = useRef(null);
	const prevMessagesLength = useRef(0);
	const isUserScrolling = useRef(false);
	const scrollTimeout = useRef(null);
	const lastMessageRef = useRef(null);
	const prevChatId = useRef(chatId);
	const scrollButtonEnabled = useRef(false);
	const shouldScrollToBottom = useRef(true); // New: tracks if we need to scroll

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
	// so oldest messages are first and newest are last
	const messages = useMemo(() => {
		const allMessages = data?.pages.flatMap(page => page.content) || [];
		return allMessages.reverse();
	}, [data]);

	useEffect(() => {
		console.log(data);
		console.log(messages);
	}, [data, messages]);

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
				// Only update button visibility if scrollButtonEnabled is true
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
	}, [messages.length]);

	// Handle scroll detection to know if user is reading old messages
	const handleScroll = () => {
		const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
		if (!scrollElement) return;
		
		const { scrollTop, scrollHeight, clientHeight } = scrollElement;
		const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
		
		// User is scrolling up if they're more than 100px from bottom
		isUserScrolling.current = distanceFromBottom > 100;
		
		// Clear existing timeout
		if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
		
		// Reset after user stops scrolling and is near bottom
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
	}, []);

	// Reset and scroll to bottom when chatId changes (switching chats)
	useEffect(() => {
		if (prevChatId.current !== chatId) {
			isUserScrolling.current = false;
			prevMessagesLength.current = 0;
			setShowScrollButton(false);
			scrollButtonEnabled.current = false;
			shouldScrollToBottom.current = true;
			prevChatId.current = chatId;
			
			// Immediately scroll to bottom when chat changes
			// Don't wait for messages effect
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
	}, [chatId, messages.length]);

	// Scroll to the bottom when messages load or when we need to scroll
	useEffect(() => {
		if (!scrollRef.current || messages.length === 0) return;

		// If we're marked to scroll to bottom (initial load when no messages were available before)
		if (shouldScrollToBottom.current) {
			setShowScrollButton(false);
			scrollButtonEnabled.current = false;
			
			setTimeout(() => {
				scrollToBottom('auto');
				
				// Enable scroll button after scroll is complete
				setTimeout(() => {
					shouldScrollToBottom.current = false;
					scrollButtonEnabled.current = true;
					prevMessagesLength.current = messages.length;
				}, 300);
			}, 100);
			return;
		}

		// When new messages are added (not from pagination), scroll to bottom smoothly
		// Only if user is not scrolling up reading old messages
		if (messages.length > prevMessagesLength.current && !isFetchingNextPage && !isUserScrolling.current) {
			scrollToBottom('smooth');
		}

		prevMessagesLength.current = messages.length;
	}, [messages, isFetchingNextPage]);

	// Intersection Observer for infinite scroll (load more when scrolling up)
	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					// Store current scroll position before fetching
					const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
					if (scrollElement) {
						const previousScrollHeight = scrollElement.scrollHeight;
						const previousScrollTop = scrollElement.scrollTop;

						fetchNextPage().then(() => {
							// Restore scroll position after new messages load at top
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

	const handleSendMessage = () => {
		if (newMessage.trim() && chatId) {
			console.log(newMessage);
			sendMessage(chatId, newMessage);
			setNewMessage('');
			console.log("sent");
			// Reset user scrolling flag when they send a message
			isUserScrolling.current = false;
		}
	};

	const handleScrollToBottom = () => {
		scrollToBottom('smooth');
		isUserScrolling.current = false;
	};

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-slate-500" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="h-full flex items-center justify-center">
				<p className="text-red-500">Failed to load messages</p>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col relative">
			{/* Header */}
			<div className="p-4 border-b border-slate-200 dark:border-slate-700 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 rounded-md">
				<div className="flex items-center gap-3">
					<Avatar className="ring-2 ring-green-500">
						<AvatarImage src={`https://avatar.vercel.sh/${chatId}.png`} />
						<AvatarFallback>UK</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-medium text-slate-900 dark:text-slate-100">User Name</p>
						<p className="text-sm text-slate-500 dark:text-slate-400">Online</p>
					</div>
				</div>
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1 p-4" ref={scrollRef}>
				{messages.length === 0 ? (
					<div className="h-full flex items-center justify-center">
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}
							className="text-center space-y-4 max-w-md"
						>
							<div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
								<Send className="h-12 w-12 text-blue-500 dark:text-blue-400" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
									Start the conversation
								</h3>
								<p className="text-slate-500 dark:text-slate-400">
									Send a message to begin chatting
								</p>
							</div>
						</motion.div>
					</div>
				) : (
					<div className="space-y-3">
						{/* Load more indicator at the top */}
						{hasNextPage && (
							<div ref={observerTarget} className="flex justify-center py-2">
								{isFetchingNextPage && (
									<Loader2 className="h-5 w-5 animate-spin text-slate-500" />
								)}
							</div>
						)}

						<AnimatePresence initial={false}>
							{messages.map((message, index) => (
								<motion.div
									key={message.id}
									ref={index === messages.length - 1 ? lastMessageRef : null}
									initial={{ opacity: 0, y: 20, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ 
										duration: 0.3,
										ease: "easeOut"
									}}
									className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
								>
									<motion.div
										whileHover={{ scale: 1.02 }}
										transition={{ duration: 0.2 }}
										className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
											message.sender === 'me'
												? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-sm'
												: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-sm'
										}`}
									>
										<p className="text-sm leading-relaxed">{message.text || message.content}</p>
										<span className={`text-xs mt-1 block ${
											message.sender === 'me' 
												? 'text-blue-100' 
												: 'text-slate-500 dark:text-slate-400 opacity-70'
										}`}>
											{message.time || new Date(message.createdAt).toLocaleTimeString([], { 
												hour: '2-digit', 
												minute: '2-digit' 
											})}
										</span>
									</motion.div>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}
			</ScrollArea>

			{/* Scroll to Bottom Button */}
			<AnimatePresence>
				{showScrollButton && messages.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.8 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.8 }}
						transition={{ duration: 0.2 }}
						className="absolute bottom-20 right-8 z-10"
					>
						<Button
							onClick={handleScrollToBottom}
							size="icon"
							className="h-12 w-12 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white transition-all hover:scale-110 active:scale-95"
						>
							<ArrowDown className="h-5 w-5" />
						</Button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Input */}
			<div className="p-4 border-t border-slate-200 dark:border-slate-700">
				<form
					className="flex gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						handleSendMessage();
					}}
				>
					<Input
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="Type a message..."
						className="flex-1"
					/>
					<Button type="submit" className="transition-transform active:scale-95">
						<Send className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}