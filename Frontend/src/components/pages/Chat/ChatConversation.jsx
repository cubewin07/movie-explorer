import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import useInfiniteMessages from '@/hooks/chat/useInfiniteMessages';
import { useChat } from '@/context/ChatProvider';

export default function ChatConversation() {
	const { chatId } = useParams();
	const [newMessage, setNewMessage] = useState('');
	const scrollRef = useRef(null);
	const observerTarget = useRef(null);

	const { sendMessage } = useChat();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError
	} = useInfiniteMessages(chatId);

	// Flatten all pages into a single messages array
	const messages = useMemo(() => data?.pages.flatMap(page => page.content) || [], [data]);

	// Scroll to the bottom when messages first load
	useEffect(() => {
		if (messages.length > 0 && scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages.length]);

	// Intersection Observer for infinite scroll (load more when scrolling up)
	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
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
		}
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
		<div className="h-full flex flex-col">
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
					<div className="space-y-4">
						{/* Load more indicator at the top */}
						{hasNextPage && (
							<div ref={observerTarget} className="flex justify-center py-2">
								{isFetchingNextPage && (
									<Loader2 className="h-5 w-5 animate-spin text-slate-500" />
								)}
							</div>
						)}

						{messages.map((message) => (
							<motion.div
								key={message.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
							>
								<motion.div
									layout
									className={`max-w-[80%] rounded-2xl px-4 py-2 transition-transform duration-300 ${
										message.sender === 'me'
											? 'bg-blue-500 dark:bg-blue-600 text-white'
											: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
									}`}
								>
									<p>{message.text || message.content}</p>
									<span className="text-xs opacity-70">
										{message.time || new Date(message.createdAt).toLocaleTimeString([], { 
											hour: '2-digit', 
											minute: '2-digit' 
										})}
									</span>
								</motion.div>
							</motion.div>
						))}
					</div>
				)}
			</ScrollArea>

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
					<Button type="submit">
						<Send className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}