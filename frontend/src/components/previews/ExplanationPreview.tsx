"use client";

import React from "react";
import { Button, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { Explanation } from "@/types";

const { Text } = Typography;

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
		<div className="px-4 mt-2">
			<div className="bg-gray-50 rounded-xl shadow-sm p-4 border border-gray-100">
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<Text type="secondary" className="text-xs">
							Explanation
						</Text>
						<Button
							type="text"
							size="small"
							className="!text-gray-400 hover:!text-gray-600"
							icon={<CloseOutlined />}
							onClick={onClose}
						/>
					</div>
					<div className="bg-white rounded p-3 border border-gray-100">
						<div className="mt-1 text-sm border-l-2 border-green-400 pl-3">
							{explanation.explanation}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ExplanationPreview;
