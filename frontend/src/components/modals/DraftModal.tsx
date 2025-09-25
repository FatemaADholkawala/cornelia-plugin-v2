"use client";

import React, { useState } from "react";
import { Modal, Button, Input, Radio } from "antd";
import { FileTextOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

interface DraftModalProps {
	isVisible: boolean;
	onClose: () => void;
	onDraft: (location: string) => void;
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
	const [draftLocation, setDraftLocation] = useState("current"); // 'current' or 'new'

	const handleDraft = () => {
		onDraft(draftLocation);
	};

	return (
		<Modal
			title={
				<div className="modal-title">
					<FileTextOutlined className="modal-icon mr-2" />
					<span>Draft with Cornelia</span>
				</div>
			}
			open={isVisible}
			onCancel={onClose}
			footer={
				<Button
					type="primary"
					icon={<CheckCircleOutlined />}
					onClick={handleDraft}
					disabled={!draftPrompt.trim()}
				>
					Generate Draft
				</Button>
			}
			width={360}
			className="draft-modal"
			closeIcon={null}
		>
			<div className="space-y-4">
				<TextArea
					rows={5}
					value={draftPrompt}
					onChange={(e) => setDraftPrompt(e.target.value)}
					onKeyPress={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							if (draftPrompt.trim()) {
								handleDraft();
							}
						}
					}}
					placeholder="What would you like to draft? Describe the content, tone, and style you need..."
					className="draft-textarea"
					autoFocus
				/>

				<div className="mt-4">
					<div className="text-sm text-gray-600 mb-2">
						Where would you like to insert the draft?
					</div>
					<Radio.Group
						value={draftLocation}
						onChange={(e) => setDraftLocation(e.target.value)}
						className="w-full space-y-2"
					>
						<Radio value="current" className="w-full">
							<div className="flex flex-col">
								<span className="font-medium">Current Document</span>
								<span className="text-xs text-gray-500">
									Insert at current cursor position
								</span>
							</div>
						</Radio>
						<Radio value="new" className="w-full">
							<div className="flex flex-col">
								<span className="font-medium">New Document</span>
								<span className="text-xs text-gray-500">
									Create and open in a new window
								</span>
							</div>
						</Radio>
					</Radio.Group>
				</div>
			</div>
		</Modal>
	);
};

export default DraftModal;
