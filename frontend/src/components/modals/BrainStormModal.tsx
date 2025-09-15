"use client";

import React, { useState } from "react";
import { Modal, Input, Button, Typography, List, Avatar, Spin } from "antd";
import {
	BulbOutlined,
	SendOutlined,
	UserOutlined,
	RobotOutlined,
} from "@ant-design/icons";
import { ChatMessage } from "@/types";

const { TextArea } = Input;
const { Text } = Typography;

interface BrainStormModalProps {
	isVisible: boolean;
	onClose: () => void;
	selectedText: string;
	documentContent: string;
	brainstormMessages: ChatMessage[];
	setBrainstormMessages: (messages: ChatMessage[]) => void;
	brainstormLoading: boolean;
	handleBrainstormSubmit: (
		message: string,
		clauseText: string,
		analysis: string,
		documentContent: string
	) => void;
}

const BrainStormModal: React.FC<BrainStormModalProps> = ({
	isVisible,
	onClose,
	selectedText,
	documentContent,
	brainstormMessages,
	setBrainstormMessages,
	brainstormLoading,
	handleBrainstormSubmit,
}) => {
	const [message, setMessage] = useState<string>("");

	const handleSubmit = (): void => {
		if (!message.trim()) return;

		handleBrainstormSubmit(message, selectedText, "", documentContent);
		setMessage("");
	};

	const handleKeyPress = (e: React.KeyboardEvent): void => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<Modal
			title={
				<div className="flex items-center gap-2">
					<BulbOutlined className="text-yellow-600" />
					<span>Brainstorm Solutions</span>
				</div>
			}
			open={isVisible}
			onCancel={onClose}
			footer={null}
			width={800}
			className="brainstorm-modal"
		>
			<div className="space-y-4">
				{selectedText && (
					<div className="p-3 bg-gray-50 rounded-lg">
						<Text strong className="text-sm text-gray-600">
							Selected Text:
						</Text>
						<div className="mt-1">
							<Text className="text-sm italic text-gray-700">
								"{selectedText}"
							</Text>
						</div>
					</div>
				)}

				<div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
					{brainstormMessages.length === 0 ? (
						<div className="flex items-center justify-center h-full text-center">
							<div>
								<BulbOutlined className="text-4xl text-gray-300 mb-2" />
								<Text type="secondary">
									Start brainstorming ideas for this clause
								</Text>
							</div>
						</div>
					) : (
						<List
							dataSource={brainstormMessages}
							renderItem={(msg) => (
								<List.Item className="!px-0 !py-2">
									<div className="flex items-start gap-3 w-full">
										<Avatar
											icon={
												msg.role === "user" ? (
													<UserOutlined />
												) : (
													<RobotOutlined />
												)
											}
											className={
												msg.role === "user" ? "bg-blue-500" : "bg-green-500"
											}
										/>
										<div className="flex-1">
											<div className="bg-gray-50 rounded-lg p-3">
												<Text className="text-sm whitespace-pre-wrap">
													{msg.content}
												</Text>
											</div>
											<Text className="text-xs text-gray-500 mt-1">
												{new Date(msg.timestamp).toLocaleTimeString()}
											</Text>
										</div>
									</div>
								</List.Item>
							)}
						/>
					)}
					{brainstormLoading && (
						<div className="flex items-center justify-center py-4">
							<Spin size="small" />
							<Text className="ml-2 text-gray-500">Generating ideas...</Text>
						</div>
					)}
				</div>

				<div className="flex gap-2">
					<TextArea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Ask for alternative approaches, risk mitigation strategies, or improvement suggestions..."
						rows={3}
						className="flex-1"
						disabled={brainstormLoading}
					/>
					<Button
						type="primary"
						icon={<SendOutlined />}
						onClick={handleSubmit}
						loading={brainstormLoading}
						disabled={!message.trim() || brainstormLoading}
						className="bg-yellow-600 hover:bg-yellow-700 border-yellow-600"
					>
						Send
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default BrainStormModal;
