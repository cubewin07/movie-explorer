import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

const SAMPLE_MESSAGES = [
	{ id: 1, sender: 'other', text: 'Hey there!', time: '10:00' },
	{ id: 2, sender: 'me', text: 'Hi! How are you?', time: '10:01' },
	{ id: 3, sender: 'other', text: 'I\'m good, thanks! Did you watch the new movie?', time: '10:02' }
];

export default function ChatConversation() {
	const { chatId } = useParams();
	const [newMessage, setNewMessage] = useState('');
	const [messages, setMessages] = useState(SAMPLE_MESSAGES);
	const scrollRef = useRef(null);

	// Scroll to the bottom when a new message is added
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSendMessage = () => {
		if (newMessage.trim()) {
			setMessages((prev) => [
				...prev,
				{ id: Date.now(), sender: 'me', text: newMessage, time: 'Now' }
			]);
			setNewMessage('');
		}
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-slate-200 dark:border-slate-700 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
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
				<div className="space-y-4">
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
								<p>{message.text}</p>
								<span className="text-xs opacity-70">{message.time}</span>
							</motion.div>
						</motion.div>
					))}
				</div>
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
