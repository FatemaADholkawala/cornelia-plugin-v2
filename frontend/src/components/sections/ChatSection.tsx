"use client";

import React from "react";
import { Button, Typography } from "antd";
import { MessageOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ChatSectionProps {
	setActiveView: (view: any) => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({ setActiveView }) => {
	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<MessageOutlined className="text-xl text-green-600" />
					<Text strong className="text-lg">
						Chat with Cornelia
					</Text>
				</div>
				<Button
					type="link"
					icon={<ArrowRightOutlined />}
					onClick={() => setActiveView("chat")}
					className="text-green-600 hover:text-green-700"
				>
					Open Chat
				</Button>
			</div>

			<div className="min-h-[120px] flex items-center justify-center">
				<div className="text-center">
					<MessageOutlined className="text-4xl text-gray-300 mb-2" />
					<Text type="secondary">Ask questions about your document</Text>
					<div className="mt-3">
						<Button
							type="primary"
							onClick={() => setActiveView("chat")}
							className="bg-green-600 hover:bg-green-700 border-green-600"
						>
							Start Chat
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatSection;
