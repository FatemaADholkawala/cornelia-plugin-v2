"use client";

import React from "react";
import { Modal, Input, Button, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

interface RedraftModalProps {
	isVisible: boolean;
	onClose: () => void;
	onRedraft: () => void;
	redraftContent: string;
	setRedraftContent: (content: string) => void;
	redraftTextAreaRef: React.RefObject<HTMLTextAreaElement>;
}

const RedraftModal: React.FC<RedraftModalProps> = ({
	isVisible,
	onClose,
	onRedraft,
	redraftContent,
	setRedraftContent,
	redraftTextAreaRef,
}) => {
	return (
		<Modal
			title={
				<div className="flex items-center gap-2">
					<EditOutlined className="text-blue-600" />
					<span>Redraft Instructions</span>
				</div>
			}
			open={isVisible}
			onCancel={onClose}
			footer={[
				<Button key="cancel" onClick={onClose}>
					Cancel
				</Button>,
				<Button
					key="redraft"
					type="primary"
					onClick={onRedraft}
					disabled={!redraftContent.trim()}
					className="bg-blue-600 hover:bg-blue-700 border-blue-600"
				>
					Generate Redraft
				</Button>,
			]}
			width={600}
			className="redraft-modal"
		>
			<div className="space-y-4">
				<div>
					<Text strong className="text-gray-700">
						Provide specific instructions for redrafting the selected text:
					</Text>
				</div>
				<TextArea
					ref={redraftTextAreaRef}
					value={redraftContent}
					onChange={(e) => setRedraftContent(e.target.value)}
					placeholder="Enter your redrafting instructions here... (e.g., 'Make this more specific', 'Add liability limitations', 'Clarify the payment terms')"
					rows={6}
					className="w-full"
				/>
				<div className="text-sm text-gray-500">
					<Text type="secondary">
						Be specific about what changes you want to make to improve the
						clause.
					</Text>
				</div>
			</div>
		</Modal>
	);
};

export default RedraftModal;
