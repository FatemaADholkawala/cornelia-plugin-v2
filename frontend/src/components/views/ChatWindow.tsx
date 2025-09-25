"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { ChatMessage } from "@/types";

interface ChatWindowProps {
	documentContent: string;
	messages: ChatMessage[];
	setMessages: (messages: ChatMessage[]) => void;
	isLoading: boolean;
	error?: string;
	onSubmit: (
		message: string,
		clauseText: string,
		analysis: string,
		documentContent: string
	) => void;
	selectedText?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
	documentContent,
	messages,
	setMessages,
	isLoading,
	error,
	onSubmit,
	selectedText,
}) => {
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// Format timestamp to remove seconds
	const formatTimestamp = (timestamp: string | Date): string => {
		// Handle timestamp that's already in string format (HH:MM:SS AM/PM)
		if (typeof timestamp === "string") {
			const timeParts = timestamp.split(":");
			if (timeParts.length === 3) {
				const [hours, minutes, secondsWithAmPm] = timeParts;
				const amPm = secondsWithAmPm.split(" ")[1];
				return `${hours}:${minutes} ${amPm}`.toLowerCase();
			}
			return timestamp; // Return as is if not in expected format
		}

		// Handle Date object
		return new Date(timestamp)
			.toLocaleTimeString([], {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			})
			.toLowerCase();
	};

	const searchInDocument = async (searchText: string): Promise<void> => {
		try {
			// Check if we're in Office environment and Word is available
			if (
				typeof window !== "undefined" &&
				typeof Office !== "undefined" &&
				Office.context &&
				Office.context.document &&
				typeof Word !== "undefined"
			) {
				await Word.run(async (context) => {
					const body = context.document.body;
					body.load("text");
					await context.sync();

					const searchResults = body.search(searchText, { matchCase: false });
					context.load(searchResults, "text");
					await context.sync();

					if (searchResults.items.length > 0) {
						const firstResult = searchResults.items[0];
						firstResult.select();
						await context.sync();
					}
				});
			} else {
				console.log("Not in Office environment - search not available");
			}
		} catch (error) {
			console.error("Error searching document:", error);
		}
	};

	const handleSubmit = async (): Promise<void> => {
		if (!input.trim() || isLoading) return;

		const userMessage: ChatMessage = {
			id: `user-${Date.now()}`,
			content: input,
			sender: "user",
			timestamp: new Date().toISOString(),
		};

		setMessages([...messages, userMessage]);
		setInput("");

		try {
			await onSubmit(input, selectedText || "", "", documentContent);
		} catch (error) {
			console.error("Error submitting message:", error);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent): void => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	return (
		<div className="flex flex-col h-full bg-white">
			{/* Messages */}
			<div
				ref={chatContainerRef}
				className="flex-1 overflow-y-auto p-4 space-y-4"
			>
				{messages.map((message) => (
					<div
						key={message.id}
						className={`flex ${
							message.sender === "user" ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`max-w-[80%] rounded-lg px-3 py-2 ${
								message.sender === "user"
									? "bg-blue-500 text-white"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							<div className="text-sm">{message.content}</div>
							<div
								className={`text-xs mt-1 ${
									message.sender === "user" ? "text-blue-100" : "text-gray-500"
								}`}
							>
								{formatTimestamp(message.timestamp)}
							</div>
						</div>
					</div>
				))}

				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center space-x-2">
							<Spin size="small" />
							<span className="text-sm text-gray-600">Thinking...</span>
						</div>
					</div>
				)}

				{error && (
					<div className="flex justify-start">
						<div className="bg-red-100 border border-red-300 rounded-lg px-3 py-2">
							<div className="text-sm text-red-800">{error}</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="border-t p-4">
				<div className="flex space-x-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Ask about the selected text or document..."
						disabled={isLoading}
						className="flex-1"
					/>
					<Button
						type="primary"
						icon={<SendOutlined />}
						onClick={handleSubmit}
						disabled={!input.trim() || isLoading}
						loading={isLoading}
					>
						Send
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ChatWindow;
