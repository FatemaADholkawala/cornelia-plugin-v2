"use client";

import React from "react";
import { Modal, Input, Button, Typography, Spin } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

interface DraftModalProps {
	isVisible: boolean;
	onClose: () => void;
	onDraft: () => void;
	draftPrompt: string;
	setDraftPrompt: (prompt: string) => void;
}

const DraftModal: React.FC<DraftModalProps> = ({
	isVisible,
	onClose,
	onDraft,
	draftPrompt,
	setDraftPrompt,
}) => {
	return (
		<Modal
			title={
				<div className="flex items-center gap-2">
					<FileTextOutlined className="text-green-600" />
					<span>Draft New Content</span>
				</div>
			}
			open={isVisible}
			onCancel={onClose}
			footer={[
				<Button key="cancel" onClick={onClose}>
					Cancel
				</Button>,
				<Button
					key="draft"
					type="primary"
					onClick={onDraft}
					disabled={!draftPrompt.trim()}
					className="bg-green-600 hover:bg-green-700 border-green-600"
				>
					Generate Draft
				</Button>,
			]}
			width={700}
			className="draft-modal"
		>
			<div className="space-y-4">
				<div>
					<Text strong className="text-gray-700">
						Describe what you want to draft:
					</Text>
				</div>
				<TextArea
					value={draftPrompt}
					onChange={(e) => setDraftPrompt(e.target.value)}
					placeholder="Enter your requirements for the new content... (e.g., 'Draft a confidentiality clause for a software development agreement', 'Create a payment terms section for a consulting contract')"
					rows={8}
					className="w-full"
				/>
				<div className="text-sm text-gray-500">
					<Text type="secondary">
						Be specific about the type of content, context, and any particular
						requirements you have.
					</Text>
				</div>
			</div>
		</Modal>
	);
};

export default DraftModal;
