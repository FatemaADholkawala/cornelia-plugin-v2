"use client";

import React from "react";
import { Modal, Typography } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import { ChatMessage } from "@/types";
import ChatWindow from "../views/ChatWindow";

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
	return (
		<Modal
			title={
				<div className="modal-title text-sm sm:text-base">
					<BulbOutlined className="modal-icon text-purple-500 pr-1" />
					<span>Brainstorm Solutions</span>
				</div>
			}
			open={isVisible}
			onCancel={onClose}
			footer={null}
			width="90vw"
			className="sm:max-w-[800px] brainstorm-modal"
			centered={true}
			style={{
				padding: 0,
			}}
		>
			<div className="flex flex-col h-[500px]">
				<div className="mb-3 p-2 bg-gray-50 rounded text-sm">
					<Text strong>Selected Text:</Text>
					<div className="mt-1 max-h-[60px] overflow-y-auto text-gray-600">
						{selectedText}
					</div>
				</div>
				<div className="flex-1 border rounded-lg overflow-hidden">
					<ChatWindow
						documentContent={documentContent}
						messages={brainstormMessages}
						setMessages={setBrainstormMessages}
						isLoading={brainstormLoading}
						onSubmit={handleBrainstormSubmit}
						selectedText={selectedText}
					/>
				</div>
			</div>
		</Modal>
	);
};

export default BrainStormModal;
