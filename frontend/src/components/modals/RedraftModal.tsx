"use client";

import React from "react";
import { Modal, Button, Input } from "antd";
import { EditOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

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
				<div className="modal-title">
					<EditOutlined className="modal-icon mr-2" />
					<span>Redraft with Cornelia</span>
				</div>
			}
			open={isVisible}
			onCancel={onClose}
			footer={
				<Button
					type="primary"
					icon={<CheckCircleOutlined />}
					onClick={onRedraft}
				>
					Redraft
				</Button>
			}
			width={360}
			className="redraft-modal"
			closeIcon={null}
		>
			<TextArea
				ref={redraftTextAreaRef}
				rows={5}
				value={redraftContent}
				onChange={(e) => setRedraftContent(e.target.value)}
				onKeyPress={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						onRedraft();
					}
				}}
				placeholder="Give instructions for your redraft..."
				className="redraft-textarea"
			/>
		</Modal>
	);
};

export default RedraftModal;
