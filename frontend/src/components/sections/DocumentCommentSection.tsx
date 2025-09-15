"use client";

import React from "react";
import { List, Typography, Tag, Empty } from "antd";
import { CommentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Comment } from "@/types";

const { Text } = Typography;

interface DocumentCommentSectionProps {
	comments: Comment[];
	setComments?: (comments: Comment[]) => void;
	initialResolvedComments?: Comment[];
	onCommentUpdate?: (comment: Comment) => void;
}

const DocumentCommentSection: React.FC<DocumentCommentSectionProps> = ({
	comments,
	// optional handlers not used in this read-only view
}) => {
	const formatTimestamp = (timestamp: string): string => {
		return new Date(timestamp).toLocaleString();
	};

	return (
		<div className="px-4">
			<div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<CommentOutlined className="text-xl text-purple-600" />
						<Text strong className="text-lg">
							Document Comments
						</Text>
						{comments.length > 0 && <Tag color="blue">{comments.length}</Tag>}
					</div>
				</div>

				<div className="max-h-64 overflow-y-auto">
					{comments.length === 0 ? (
						<Empty
							image={<CommentOutlined className="text-4xl text-gray-300" />}
							description="No comments yet"
							className="py-8"
						/>
					) : (
						<List
							dataSource={comments}
							renderItem={(comment) => (
								<List.Item className="!px-0 !py-3 border-b border-gray-100 last:border-b-0">
									<div className="w-full">
										<div className="flex items-start justify-between mb-2">
											<Text className="text-gray-700">{comment.text}</Text>
											<div className="flex items-center gap-2 text-xs text-gray-500">
												<ClockCircleOutlined />
												<span>{formatTimestamp(comment.timestamp)}</span>
											</div>
										</div>
										{comment.isResolved && <Tag color="green">Resolved</Tag>}
									</div>
								</List.Item>
							)}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default DocumentCommentSection;
