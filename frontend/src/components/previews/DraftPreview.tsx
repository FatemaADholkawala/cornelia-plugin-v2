"use client";

import React from "react";
import { Button, Typography } from "antd";
import {
	CloseOutlined,
	FileTextOutlined,
	CheckOutlined,
} from "@ant-design/icons";
import { Draft } from "@/types";

const { Text } = Typography;

interface DraftPreviewProps {
	draft: Draft | null;
	onClose: () => void;
	onInsert: () => void;
}

const DraftPreview: React.FC<DraftPreviewProps> = ({
	draft,
	onClose,
	onInsert,
}) => {
	if (!draft) return null;

	// Function to format text with markdown-style formatting
	const formatText = (text: string): string => {
		if (!text) return "";

		let formattedText = text;

		// Convert **text** to bold (make sure to handle nested cases)
		formattedText = formattedText.replace(
			/\*\*(.*?)\*\*/g,
			'<strong style="font-weight: 700;">$1</strong>'
		);

		// Convert *text* to italic (only single asterisks that aren't part of double asterisks)
		formattedText = formattedText.replace(
			/(?<!\*)\*([^*]+?)\*(?!\*)/g,
			"<em>$1</em>"
		);

		// Convert line breaks to <br> tags
		formattedText = formattedText.replace(/\n/g, "<br>");

		// Make section numbers and list items bold
		formattedText = formattedText.replace(
			/^(\d+\.\s+)/gm,
			'<strong style="font-weight: 600;">$1</strong>'
		);
		formattedText = formattedText.replace(
			/^(\d+\.\d+\.\s+)/gm,
			'<strong style="font-weight: 600;">$1</strong>'
		);
		formattedText = formattedText.replace(
			/^([a-z]\.\s+)/gm,
			'<strong style="font-weight: 600;">$1</strong>'
		);

		// Handle subsections like (a), (b), etc.
		formattedText = formattedText.replace(
			/\(([a-z])\)/g,
			"<strong>($1)</strong>"
		);

		// Handle "WHEREAS" and similar legal terms
		formattedText = formattedText.replace(
			/^(WHEREAS|NOW THEREFORE|RECITALS)/gm,
			'<strong style="font-weight: 700; text-decoration: underline;">$1</strong>'
		);

		// Handle section headers that are all caps
		formattedText = formattedText.replace(
			/^([A-Z\s]{3,}):?\s*$/gm,
			'<strong style="font-weight: 700; font-size: 1.1em; color: #1f2937;">$1</strong>'
		);

		return formattedText;
	};

	const previewStyles = {
		fontFamily: '"Georgia", "Times New Roman", serif',
		lineHeight: "1.7",
		fontSize: "14px",
		color: "#374151",
	};

	return (
		<div className="px-4 mt-2">
			<div className="bg-gray-50 rounded-xl shadow-sm p-4 border border-gray-100">
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<Text type="secondary" className="text-xs">
							Generated Draft
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
						<div className="text-xs text-gray-500 mb-2">
							<FileTextOutlined className="mr-1" />
							Prompt: "{draft.prompt}"
						</div>
						<div
							className="mt-1 text-sm border-l-2 border-blue-400 pl-3 leading-relaxed draft-preview-content"
							dangerouslySetInnerHTML={{
								__html: formatText(draft.draftedText),
							}}
						/>
					</div>
					<div className="flex justify-end gap-2 mt-2">
						<Button
							type="primary"
							size="small"
							icon={<CheckOutlined />}
							onClick={onInsert}
						>
							Insert into Document
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DraftPreview;
