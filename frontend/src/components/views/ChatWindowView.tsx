"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { ChatMessage } from "@/types";

interface ChatWindowViewProps {
	chatMessages: ChatMessage[];
	setChatMessages: (messages: ChatMessage[]) => void;
	chatLoading: boolean;
	chatError: string | null;
	handleChatSubmit: (message: string) => void;
	setActiveView: (view: any) => void;
}

const ChatWindowView: React.FC<ChatWindowViewProps> = ({
	chatMessages,
	setChatMessages,
	chatLoading,
	chatError,
	handleChatSubmit,
	setActiveView,
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
						searchResults.items[0].select();
						searchResults.items[0].scrollIntoView();

						setTimeout(async () => {
							await Word.run(async (context) => {
								searchResults.items[0].font.highlightColor = "None";
								await context.sync();
							});
						}, 2000);
					}
				});
			} else {
				console.log("Not in Office environment - search not available");
			}
		} catch (error) {
			console.error("Error searching document:", error);
		}
	};

	const renderInlineFormatting = (text: string): React.ReactNode => {
		if (!text) return null;

		const parts = text.split(/(\*\*\*\*.*?\*\*\*\*|\*\*.*?\*\*|\[\[.*?\]\])/g);

		return parts.map((part, index) => {
			// Handle bold text with 4 asterisks
			if (part?.match(/^\*\*\*\*.*\*\*\*\*$/)) {
				return (
					<strong
						key={`bold4-${index}`}
						className="text-blue-700 font-semibold"
					>
						{part.slice(4, -4)}
					</strong>
				);
			}

			// Handle bold text with 2 asterisks
			if (part?.match(/^\*\*.*\*\*$/)) {
				return (
					<strong
						key={`bold2-${index}`}
						className="text-blue-700 font-semibold"
					>
						{part.slice(2, -2)}
					</strong>
				);
			}

			// Handle [[citations]]
			if (part?.match(/\[\[(.*?)\]\]/)) {
				const citationText = part.match(/\[\[(.*?)\]\]/)?.[1];
				return (
					<a
						key={`citation-${index}`}
						href="#"
						className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
						onClick={(e) => {
							e.preventDefault();
							if (citationText) {
								searchInDocument(citationText);
							}
						}}
					>
						{citationText}
					</a>
				);
			}

			return part;
		});
	};

	const renderMessageContent = (
		content: string,
		isUserMessage: boolean
	): React.ReactNode => {
		if (!content) return null;

		// Replace citations like [[text]]{{None}} with just [[text]]
		content = content.replace(/\{\{None\}\}/g, "");

		// Split content into sections (paragraphs, headings, bullet points)
		const sections = content.split(/\n\n/).filter(Boolean);

		return sections.map((section, sIndex) => {
			if (section.startsWith("**")) {
				// Format headings (bold)
				return (
					<h2
						key={sIndex}
						className={`font-bold text-lg mb-2 ${
							isUserMessage ? "text-white" : "text-blue-700"
						}`}
					>
						{section.replace(/\*\*/g, "")}
					</h2>
				);
			}

			if (section.startsWith("*")) {
				// Format bullet points
				const listItems = section.split("\n").map((item, iIndex) => (
					<li
						key={iIndex}
						className={`ml-4 list-disc ${isUserMessage ? "text-white" : ""}`}
					>
						{renderInlineFormatting(item.replace(/^\*\s*/, ""))}
					</li>
				));

				return (
					<ul key={sIndex} className="mb-4">
						{listItems}
					</ul>
				);
			}

			// Default: Normal paragraph
			return (
				<p
					key={sIndex}
					className={`mb-4 leading-relaxed ${
						isUserMessage ? "text-white" : "text-gray-800"
					}`}
				>
					{renderInlineFormatting(section)}
				</p>
			);
		});
	};

	useEffect(() => {
		if (chatMessages.length === 0) {
			setChatMessages([
				{
					id: "initial-tip",
					role: "assistant",
					content:
						"Hi! I can help you analyze this document. What would you like to know?",
					isInitialTip: true,
					timestamp: new Date().toLocaleTimeString(),
				},
			]);
		}
	}, []);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	useEffect(() => {
		scrollToBottom();
	}, [chatMessages]);

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!input.trim() || chatLoading) return;

		const messageText = input.trim();
		setInput("");
		await handleChatSubmit(messageText);
	};

	return (
		<div className="flex flex-col h-full bg-gray-50">
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{chatMessages.map((message, index) => {
					const isSystemMessage = message.isInitialTip || message.isError;

					return (
						<div
							key={message.id || index}
							className={`animate-fadeIn ${
								isSystemMessage
									? "flex justify-center"
									: message.role === "user"
									? "flex flex-col items-end"
									: "flex flex-col items-start"
							}`}
							ref={index === chatMessages.length - 1 ? messagesEndRef : null}
						>
							{isSystemMessage ? (
								<div
									className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-full 
                    text-xs font-medium text-gray-600 border border-gray-200 shadow-sm"
								>
									<span className="w-4 h-4">ℹ</span>
									{message.content}
								</div>
							) : (
								<div className="space-y-1.5 max-w-[85%] group">
									<div
										className={`px-4 py-3 rounded-2xl ${
											message.role === "user"
												? "bg-blue-600 text-white shadow-sm"
												: "bg-white text-gray-800 shadow-md"
										}`}
									>
										<div className="text-sm prose prose-sm max-w-none">
											{renderMessageContent(
												message.content,
												message.role === "user"
											)}
										</div>
									</div>
									<div
										className={`text-xs opacity-70 group-hover:opacity-100 transition-opacity ${
											message.role === "user"
												? "text-right text-blue-700"
												: "text-left text-gray-600"
										}`}
									>
										{formatTimestamp(message.timestamp)}
									</div>
								</div>
							)}
						</div>
					);
				})}
				{chatLoading && (
					<div className="flex justify-center items-center p-4">
						<Spin size="small" />
					</div>
				)}
			</div>

			<div className="border-t p-4 bg-white shadow-sm">
				<form onSubmit={handleSubmit} className="flex items-center gap-3">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={
							chatLoading
								? "Waiting for response..."
								: "Type your question here..."
						}
						className="flex-grow rounded-full border-gray-200 hover:border-gray-300 focus:border-blue-500 
        shadow-sm transition-colors duration-200"
					/>
					<Button
						type="text"
						htmlType="submit"
						icon={<SendOutlined />}
						disabled={chatLoading || !input.trim()}
						className={`flex items-center justify-center !p-2
        transition-all duration-200 hover:scale-105 ${
					chatLoading || !input.trim()
						? "opacity-50 cursor-not-allowed"
						: "text-blue-600 hover:text-blue-700"
				}`}
					/>
				</form>
			</div>
		</div>
	);
};

export default ChatWindowView;
