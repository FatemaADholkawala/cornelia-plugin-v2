"use client";

import React from "react";
import { Card, Button, Typography, Divider } from "antd";
import { InfoCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { Explanation } from "@/types";

const { Text, Paragraph } = Typography;

interface ExplanationPreviewProps {
	explanation: Explanation | null;
	onClose: () => void;
}

const ExplanationPreview: React.FC<ExplanationPreviewProps> = ({
	explanation,
	onClose,
}) => {
	if (!explanation) return null;

	return (
		<div className="px-4">
			<Card className="border-blue-200 bg-blue-50">
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center gap-2">
						<InfoCircleOutlined className="text-blue-600 text-xl" />
						<Text strong className="text-lg text-blue-800">
							Explanation
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
							Selected Text:
						</Text>
						<div className="mt-1 p-3 bg-white rounded border-l-4 border-blue-500">
							<Text className="italic text-gray-700">"{explanation.text}"</Text>
						</div>
					</div>

					<Divider className="my-4" />

					<div>
						<Text strong className="text-gray-700">
							Analysis:
						</Text>
						<div className="mt-2">
							<Paragraph className="text-gray-700 whitespace-pre-wrap">
								{explanation.explanation}
							</Paragraph>
						</div>
					</div>

					<div className="text-xs text-gray-500">
						Generated at: {new Date(explanation.timestamp).toLocaleString()}
					</div>
				</div>
			</Card>
		</div>
	);
};

export default ExplanationPreview;
