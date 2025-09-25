"use client";

import React from "react";
import { Button, Typography, Input } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
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
		<div className="px-4 mt-4">
			<div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between border-b border-gray-100 pb-2">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-blue-500"></div>
							<Text type="secondary" className="text-sm font-medium">
								New Comment
							</Text>
						</div>
						<Button
							type="text"
							size="small"
							className="!text-gray-400 hover:!text-red-500 transition-colors duration-200"
							icon={<CloseOutlined />}
							onClick={onClose}
						/>
					</div>
					<div className="bg-gray-50 rounded-lg p-4 border border-gray-100 focus-within:border-blue-200 focus-within:ring-1 focus-within:ring-blue-100 transition-all duration-200">
						<TextArea
							value={comment.text}
							onChange={onChange}
							onKeyPress={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									if (comment.text.trim()) {
										onSubmit();
									}
								}
							}}
							placeholder="Type your comment here..."
							autoFocus
							className="mt-1 border-none focus:shadow-none bg-transparent resize-none"
							rows={4}
						/>
					</div>
					<div className="flex justify-end mt-1">
						<Button
							type="primary"
							size="middle"
							icon={<CheckOutlined />}
							loading={isLoading}
							disabled={!comment.text.trim()}
							onClick={onSubmit}
							className="hover:scale-105 transition-transform duration-200"
						>
							Add Comment
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CommentPreview;
