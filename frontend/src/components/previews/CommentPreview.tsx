"use client";

import React from "react";
import { Card, Button, Typography, Input, Space } from "antd";
import {
	CommentOutlined,
	CloseOutlined,
	SendOutlined,
} from "@ant-design/icons";
import { CommentDraft } from "@/types";

const { TextArea } = Input;
const { Text } = Typography;

interface CommentPreviewProps {
	comment: CommentDraft | null;
	onClose: () => void;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onSubmit: () => void;
	isLoading: boolean;
}

const CommentPreview: React.FC<CommentPreviewProps> = ({
	comment,
	onClose,
	onChange,
	onSubmit,
	isLoading,
}) => {
	if (!comment) return null;

	return (
		<div className="px-4">
			<Card className="border-purple-200 bg-purple-50">
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center gap-2">
						<CommentOutlined className="text-purple-600 text-xl" />
						<Text strong className="text-lg text-purple-800">
							Add Comment
						</Text>
					</div>
					<Button
						type="text"
						icon={<CloseOutlined />}
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					/>
				</div>

				<div className="space-y-4">
					<div>
						<Text strong className="text-gray-700">
							Your Comment:
						</Text>
						<div className="mt-2">
							<TextArea
								value={comment.text}
								onChange={onChange}
								placeholder="Enter your comment about the selected text..."
								rows={4}
								className="w-full"
								disabled={isLoading}
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<Space>
							<Button onClick={onClose} disabled={isLoading}>
								Cancel
							</Button>
							<Button
								type="primary"
								icon={<SendOutlined />}
								onClick={onSubmit}
								loading={isLoading}
								disabled={!comment.text.trim() || isLoading}
								className="bg-purple-600 hover:bg-purple-700 border-purple-600"
							>
								Add Comment
							</Button>
						</Space>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default CommentPreview;
