"use client";

import React, { useState, useRef, useEffect } from "react";
import {
	Card,
	Input,
	Button,
	Typography,
	List,
	Avatar,
	Spin,
	Empty,
} from "antd";
import {
	MessageOutlined,
	SendOutlined,
	UserOutlined,
	RobotOutlined,
	ArrowLeftOutlined,
} from "@ant-design/icons";
import { ChatMessage } from "@/types";

const { TextArea } = Input;
const { Text, Title } = Typography;

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
	const [message, setMessage] = useState<string>("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = (): void => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [chatMessages]);

	const handleSubmit = (): void => {
		if (!message.trim() || chatLoading) return;

		handleChatSubmit(message);
		setMessage("");
	};

	const handleKeyPress = (e: React.KeyboardEvent): void => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const formatTimestamp = (timestamp: string): string => {
		return new Date(timestamp).toLocaleTimeString();
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="flex items-center gap-3 p-4 bg-white border-b">
				<Button
					icon={<ArrowLeftOutlined />}
					onClick={() => setActiveView("home")}
					type="text"
				/>
				<MessageOutlined className="text-2xl text-green-600" />
				<Title level={3} className="!mb-0">
					Chat with Cornelia
				</Title>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 bg-gray-50">
				{chatMessages.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<Empty
							image={<MessageOutlined className="text-6xl text-gray-300" />}
							description="Start a conversation with Cornelia"
							className="py-12"
						/>
					</div>
				) : (
					<div className="space-y-4">
						{chatMessages.map((msg) => (
							<div
								key={msg.id}
								className={`flex items-start gap-3 ${
									msg.role === "user" ? "justify-end" : "justify-start"
								}`}
							>
								{msg.role === "assistant" && (
									<Avatar
										icon={<RobotOutlined />}
										className="bg-green-500 flex-shrink-0"
									/>
								)}

								<div
									className={`max-w-[70%] rounded-lg p-3 ${
										msg.role === "user"
											? "bg-blue-500 text-white"
											: "bg-white border border-gray-200"
									}`}
								>
									<div className="whitespace-pre-wrap text-sm">
										{msg.content}
									</div>
									<div
										className={`text-xs mt-1 ${
											msg.role === "user" ? "text-blue-100" : "text-gray-500"
										}`}
									>
										{formatTimestamp(msg.timestamp)}
									</div>
								</div>

								{msg.role === "user" && (
									<Avatar
										icon={<UserOutlined />}
										className="bg-blue-500 flex-shrink-0"
									/>
								)}
							</div>
						))}

						{chatLoading && (
							<div className="flex items-start gap-3">
								<Avatar
									icon={<RobotOutlined />}
									className="bg-green-500 flex-shrink-0"
								/>
								<div className="bg-white border border-gray-200 rounded-lg p-3">
									<div className="flex items-center gap-2">
										<Spin size="small" />
										<Text className="text-gray-500 text-sm">
											Cornelia is thinking...
										</Text>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* Input */}
			<div className="p-4 bg-white border-t">
				<div className="flex gap-2">
					<TextArea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Ask Cornelia about your document..."
						rows={3}
						className="flex-1"
						disabled={chatLoading}
					/>
					<Button
						type="primary"
						icon={<SendOutlined />}
						onClick={handleSubmit}
						loading={chatLoading}
						disabled={!message.trim() || chatLoading}
						className="bg-green-600 hover:bg-green-700 border-green-600 self-end"
					>
						Send
					</Button>
				</div>

				{chatError && (
					<div className="mt-2 text-red-500 text-sm">{chatError}</div>
				)}
			</div>
		</div>
	);
};

export default ChatWindowView;
