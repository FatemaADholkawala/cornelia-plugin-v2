"use client";

import React from "react";
import { Card, Button, Typography, Divider, Space } from "antd";
import {
	EditOutlined,
	CloseOutlined,
	ReloadOutlined,
	CheckOutlined,
} from "@ant-design/icons";
import { RedraftContent } from "@/types";

const { Text, Paragraph } = Typography;

interface RedraftPreviewProps {
	redraft: RedraftContent | null;
	onClose: () => void;
	onRegenerate: () => void;
	onAccept: () => void;
}

const RedraftPreview: React.FC<RedraftPreviewProps> = ({
	redraft,
	onClose,
	onRegenerate,
	onAccept,
}) => {
	if (!redraft) return null;

	return (
		<div className="px-4">
			<Card className="border-green-200 bg-green-50">
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center gap-2">
						<EditOutlined className="text-green-600 text-xl" />
						<Text strong className="text-lg text-green-800">
							Redraft Preview
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
							Original Text:
						</Text>
						<div className="mt-1 p-3 bg-white rounded border-l-4 border-gray-300">
							<Text className="text-gray-700">{redraft.originalText}</Text>
						</div>
					</div>

					<div>
						<Text strong className="text-gray-700">
							Instructions:
						</Text>
						<div className="mt-1 p-3 bg-white rounded border-l-4 border-blue-300">
							<Text className="italic text-gray-700">
								"{redraft.instructions}"
							</Text>
						</div>
					</div>

					<Divider className="my-4" />

					<div>
						<Text strong className="text-gray-700">
							Redrafted Version:
						</Text>
						<div className="mt-2 p-4 bg-white rounded border-l-4 border-green-500">
							<Paragraph className="text-gray-700 whitespace-pre-wrap">
								{redraft.redraftedText}
							</Paragraph>
						</div>
					</div>

					<div className="flex justify-between items-center pt-4">
						<div className="text-xs text-gray-500">
							Generated at: {new Date(redraft.timestamp).toLocaleString()}
						</div>
						<Space>
							<Button
								icon={<ReloadOutlined />}
								onClick={onRegenerate}
								className="text-blue-600 hover:text-blue-700"
							>
								Regenerate
							</Button>
							<Button
								type="primary"
								icon={<CheckOutlined />}
								onClick={onAccept}
								className="bg-green-600 hover:bg-green-700 border-green-600"
							>
								Accept Redraft
							</Button>
						</Space>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default RedraftPreview;
