"use client";

import React from "react";
import { Button, Tooltip } from "antd";
import {
	CommentOutlined,
	InfoCircleOutlined,
	EditOutlined,
	BulbOutlined,
	FileTextOutlined,
	ThunderboltOutlined,
} from "@ant-design/icons";

interface ActionPanelSectionProps {
	selectedText: string;
	isExplaining: boolean;
	generatingRedrafts: Map<string, boolean>;
	handleExplain: () => void;
	setCommentDraft: (draft: any) => void;
	// Legacy props - kept for backward compatibility but not used
	setRedraftContent: (content: string) => void;
	setIsRedraftModalVisible: (visible: boolean) => void;
	setIsBrainstormModalVisible: (visible: boolean) => void;
	setBrainstormMessages: (messages: any[]) => void;
	// New unified negotiate props
	onNegotiateClick?: () => void;
	negotiateLoading?: boolean;
	isDrafting: boolean;
	setIsDraftModalVisible: (visible: boolean) => void;
}

const ActionPanelSection: React.FC<ActionPanelSectionProps> = ({
	selectedText,
	isExplaining,
	handleExplain,
	setCommentDraft,
	// Legacy props - commented out, kept for reference
	// setRedraftContent,
	// setIsRedraftModalVisible,
	// setIsBrainstormModalVisible,
	// setBrainstormMessages,
	// generatingRedrafts,
	onNegotiateClick,
	negotiateLoading,
	isDrafting,
	setIsDraftModalVisible,
}) => {
	return (
		<div className="px-4">
			<div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all duration-200">
				<div className="flex flex-wrap gap-2">
					{/* Comment Button - unchanged */}
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

					{/* Explain Button - unchanged */}
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

					{/* ===== NEW: UNIFIED NEGOTIATE BUTTON ===== */}
					{/* This replaces both Redraft and Brainstorm buttons */}
					<Tooltip title="Help me negotiate this clause" placement="top">
						<Button
							type="primary"
							icon={<ThunderboltOutlined />}
							className="flex-1 min-w-[120px] flex items-center justify-center gap-2 !px-4 !h-9 bg-blue-500 hover:bg-blue-600"
							disabled={!selectedText}
							loading={negotiateLoading}
							onClick={onNegotiateClick}
						>
							{negotiateLoading ? "Negotiating..." : "Negotiate"}
						</Button>
					</Tooltip>

					{/* Draft Button - unchanged */}
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

					{/* LEGACY BUTTONS - Commented out for reference */}
					{/* <Button
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
						icon={<BulbOutlined />}
						className="flex-1 min-w-[120px] flex items-center justify-center gap-2 !px-4 !h-9"
						disabled={!selectedText}
						onClick={() => {
							setIsBrainstormModalVisible(true);
							setBrainstormMessages([]);
						}}
					>
						Brainstorm
					</Button> */}
				</div>
			</div>
		</div>
	);
};

export default ActionPanelSection;
