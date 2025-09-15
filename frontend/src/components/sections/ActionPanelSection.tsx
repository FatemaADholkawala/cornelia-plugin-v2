"use client";

import React from "react";
import { Button } from "antd";
import {
	CommentOutlined,
	InfoCircleOutlined,
	EditOutlined,
	BulbOutlined,
	FileTextOutlined,
} from "@ant-design/icons";

interface ActionPanelSectionProps {
	selectedText: string;
	isExplaining: boolean;
	generatingRedrafts: Map<string, boolean>;
	handleExplain: () => void;
	setCommentDraft: (draft: any) => void;
	setRedraftContent: (content: string) => void;
	setIsRedraftModalVisible: (visible: boolean) => void;
	setIsBrainstormModalVisible: (visible: boolean) => void;
	setBrainstormMessages: (messages: any[]) => void;
	isDrafting: boolean;
	setIsDraftModalVisible: (visible: boolean) => void;
}

const ActionPanelSection: React.FC<ActionPanelSectionProps> = ({
	selectedText,
	isExplaining,
	generatingRedrafts,
	handleExplain,
	setCommentDraft,
	setRedraftContent,
	setIsRedraftModalVisible,
	setIsBrainstormModalVisible,
	setBrainstormMessages,
	isDrafting,
	setIsDraftModalVisible,
}) => {
	return (
		<div className="px-4">
			<div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all duration-200">
				<div className="flex flex-wrap gap-2">
					<Button
						type="default"
						icon={<CommentOutlined />}
						className="flex-1 min-w-[120px] flex items-center justify-center gap-2 !px-4 !h-9"
						disabled={!selectedText}
						onClick={() => {
							setCommentDraft({
								text: "",
								timestamp: new Date().toISOString(),
							});
						}}
					>
						Comment
					</Button>
					<Button
						type="default"
						icon={<InfoCircleOutlined />}
						className="flex-1 min-w-[120px] flex items-center justify-center gap-2 !px-4 !h-9"
						disabled={!selectedText}
						loading={isExplaining}
						onClick={handleExplain}
					>
						{isExplaining ? "Explaining..." : "Explain"}
					</Button>
					<Button
						type="default"
						icon={<EditOutlined />}
						className="flex-1 min-w-[120px] flex items-center justify-center gap-2 !px-4 !h-9"
						disabled={!selectedText}
						loading={generatingRedrafts.get(selectedText)}
						onClick={() => {
							setRedraftContent("");
							setIsRedraftModalVisible(true);
						}}
					>
						{generatingRedrafts.get(selectedText) ? "Redrafting..." : "Redraft"}
					</Button>
					<Button
						type="default"
						icon={<FileTextOutlined />}
						className="flex-1 min-w-[120px] flex items-center justify-center gap-2 !px-4 !h-9"
						loading={isDrafting}
						onClick={() => {
							setIsDraftModalVisible(true);
						}}
					>
						{isDrafting ? "Drafting..." : "Draft"}
					</Button>
					<Button
						type="default"
						icon={<BulbOutlined />}
						className="flex-1 min-w-[120px] flex items-center justify-center gap-2 !px-4 !h-9"
						disabled={!selectedText}
						onClick={() => {
							setIsBrainstormModalVisible(true);
							setBrainstormMessages([]);
						}}
					>
						Brainstorm
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ActionPanelSection;
