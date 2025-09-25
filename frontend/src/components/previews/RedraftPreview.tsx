"use client";

import React from "react";
import { Button, Typography } from "antd";
import { CloseOutlined, RedoOutlined, CheckOutlined } from "@ant-design/icons";
import { RedraftContent } from "@/types";

const { Text } = Typography;

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
		<div className="px-4 mt-2">
			<div className="bg-gray-50 rounded-xl shadow-sm p-4 border border-gray-100">
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<Text type="secondary" className="text-xs">
							Redraft Suggestion
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
							{redraft.redraftedText}
						</div>
					</div>
					<div className="flex justify-end gap-2 mt-2">
						<Button
							size="small"
							type="text"
							className="text-gray-500 hover:text-gray-700"
							icon={<RedoOutlined />}
							onClick={onRegenerate}
						>
							Regenerate
						</Button>
						<Button
							type="primary"
							size="small"
							icon={<CheckOutlined />}
							onClick={onAccept}
						>
							Accept
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RedraftPreview;
